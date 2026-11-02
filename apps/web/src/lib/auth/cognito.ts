import { cognitoEnv } from "~/lib/envs/cognito-env";
import {
  clearAuthSession,
  groupsFromIdToken,
  readAuthTokens,
  resolveAuthSession,
  sessionFromIdToken,
  writeAuthSession,
  type AuthSession,
  type AuthTokens,
} from "./session";

const TARGET_PREFIX = "AWSCognitoIdentityProviderService";

export class CognitoClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CognitoClientError";
  }
}

function clientId() {
  const id = cognitoEnv.userPoolClientId;
  if (!id) {
    throw new CognitoClientError(
      "MissingConfig",
      "Cognito client id is missing. Copy Auth stack outputs into apps/web/.env.",
    );
  }
  return id;
}

function cognitoUrl() {
  if (cognitoEnv.endpoint) return "/cognito-idp/";
  return `https://cognito-idp.${cognitoEnv.region}.amazonaws.com/`;
}

type CognitoBody = {
  __type?: string;
  message?: string;
  Message?: string;
  UserConfirmed?: boolean;
  CodeDeliveryDetails?: { Destination?: string; DeliveryMedium?: string };
  AuthenticationResult?: {
    IdToken?: string;
    AccessToken?: string;
    RefreshToken?: string;
  };
  ChallengeName?: string;
  Username?: string;
  UserAttributes?: Array<{ Name?: string; Value?: string }>;
};

export type CrewUser = AuthSession & {
  emailVerified?: boolean;
};

async function cognitoCall(action: string, payload: Record<string, unknown>): Promise<CognitoBody> {
  const response = await fetch(cognitoUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/x-amz-json-1.1",
      "x-amz-target": `${TARGET_PREFIX}.${action}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const body = (text ? JSON.parse(text) : {}) as CognitoBody;
  if (!response.ok) {
    const code = typeName(body.__type);
    throw new CognitoClientError(code, friendlyMessage(code, body.message ?? body.Message));
  }
  return body;
}

function typeName(raw: string | undefined) {
  if (!raw) return "UnknownError";
  const hash = raw.lastIndexOf("#");
  return hash >= 0 ? raw.slice(hash + 1) : raw;
}

function friendlyMessage(code: string, fallback?: string) {
  switch (code) {
    case "UsernameExistsException":
      return "An account with that email already exists. Sign in, or confirm the email if you just signed up.";
    case "UserNotConfirmedException":
      return "Confirm the email with the code we sent before signing in.";
    case "NotAuthorizedException":
      return "Email or password is wrong.";
    case "CodeMismatchException":
      return "That confirmation code is wrong.";
    case "ExpiredCodeException":
      return "That confirmation code expired. Resend a new one.";
    case "InvalidPasswordException":
      return "Password needs 8+ characters, mixed case, a number, and a symbol.";
    case "InvalidParameterException":
      return fallback || "Check the form and try again.";
    case "LimitExceededException":
      return "Too many attempts. Wait a minute and try again.";
    case "MissingConfig":
      return fallback || "Auth is not configured.";
    case "ResourceNotFoundException":
      return "This Cognito client is gone. Redeploy Auth and copy the new client id into apps/web/.env.";
    default:
      if (fallback?.toLowerCase().includes("client not found")) {
        return "This Cognito client is gone. Redeploy Auth and copy the new client id into apps/web/.env.";
      }
      return fallback || "Cognito rejected that request.";
  }
}

export async function signUpCrew(input: {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}) {
  const body = await cognitoCall("SignUp", {
    ClientId: clientId(),
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: "email", Value: input.email },
      { Name: "given_name", Value: input.givenName },
      { Name: "family_name", Value: input.familyName },
      { Name: "custom:role", Value: "floor" },
    ],
  });
  return {
    userConfirmed: Boolean(body.UserConfirmed),
    destination: body.CodeDeliveryDetails?.Destination,
  };
}

export async function confirmSignUp(email: string, code: string) {
  await cognitoCall("ConfirmSignUp", {
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code,
  });
}

export async function resendConfirmationCode(email: string) {
  const body = await cognitoCall("ResendConfirmationCode", {
    ClientId: clientId(),
    Username: email,
  });
  return body.CodeDeliveryDetails?.Destination;
}

export async function signInCrew(email: string, password: string) {
  const body = await cognitoCall("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId(),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });
  if (body.ChallengeName) {
    throw new CognitoClientError(
      body.ChallengeName,
      "This account needs an extra step we have not wired yet. Use a confirmed password user.",
    );
  }
  const result = body.AuthenticationResult;
  if (!result?.IdToken || !result.AccessToken) {
    throw new CognitoClientError("InvalidAuth", "Sign-in did not return tokens.");
  }
  const tokens: AuthTokens = {
    idToken: result.IdToken,
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken,
  };
  writeAuthSession(sessionFromIdToken(tokens.idToken), tokens);
}

export async function getCrewUser(): Promise<CrewUser> {
  const tokens = readAuthTokens();
  const fallback = resolveAuthSession();
  if (!tokens?.accessToken) {
    if (!fallback) {
      throw new CognitoClientError("NotAuthorizedException", "Not signed in.");
    }
    return fallback;
  }
  try {
    const body = await cognitoCall("GetUser", { AccessToken: tokens.accessToken });
    const attrs = Object.fromEntries(
      (body.UserAttributes ?? [])
        .filter((attr): attr is { Name: string; Value: string } => Boolean(attr.Name))
        .map((attr) => [attr.Name, attr.Value ?? ""]),
    );
    return {
      username: body.Username ?? attrs.email ?? fallback?.username ?? "crew",
      email: attrs.email || fallback?.email,
      givenName: attrs.given_name || fallback?.givenName,
      familyName: attrs.family_name || fallback?.familyName,
      role: attrs["custom:role"] || fallback?.role,
      emailVerified: attrs.email_verified === "true",
      groups: tokens.idToken ? groupsFromIdToken(tokens.idToken) : (fallback?.groups ?? []),
    };
  } catch {
    if (!fallback) throw new CognitoClientError("NotAuthorizedException", "Not signed in.");
    return fallback;
  }
}

export async function signOutCrew() {
  const tokens = readAuthTokens();
  try {
    if (tokens?.accessToken) {
      await cognitoCall("GlobalSignOut", { AccessToken: tokens.accessToken });
    }
  } catch {
    // Cookie/local session still has to go even if Floci rejects the revoke.
  }
  clearAuthSession();
}

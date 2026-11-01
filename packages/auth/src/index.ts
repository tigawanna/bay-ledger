import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});

// Cognito groups. Names must match auth-stack.ts.
// floor = default / basic crew (upload certs, request leave).
// managers = shift leads (roster, expiries, assignments).
export const GROUPS = {
  floor: "floor",
  managers: "managers",
} as const;

export type CrewGroup = (typeof GROUPS)[keyof typeof GROUPS];

export type PostConfirmationEvent = {
  userPoolId: string;
  userName: string;
  request: {
    userAttributes: Record<string, string>;
  };
};

function groupFromAttributes(attrs: Record<string, string>): CrewGroup {
  const role = (attrs["custom:role"] ?? attrs.role ?? "").toLowerCase();
  if (role === GROUPS.managers || role === "manager") return GROUPS.managers;
  // Missing, unknown, or "floor" → basic permissions.
  return GROUPS.floor;
}

/** Cognito PostConfirmation: put the new user in floor or managers. */
export async function handler(event: PostConfirmationEvent) {
  const group = groupFromAttributes(event.request.userAttributes);
  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: group,
    }),
  );
  return event;
}

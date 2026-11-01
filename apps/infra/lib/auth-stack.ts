import path from "node:path";
import { fileURLToPath } from "node:url";
import { CfnOutput, Duration, Stack, type StackProps } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  AccountRecovery,
  CfnUserPoolGroup,
  StringAttribute,
  UserPool,
  UserPoolClientIdentityProvider,
  UserPoolOperation,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

const here = path.dirname(fileURLToPath(import.meta.url));
const packages = path.join(here, "../../../packages");

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Directory of crew accounts. Email is the username. Pre-sign-up auto
    // confirms (Floci never sends the verification mail). Post-confirmation
    // then puts the user in a group.
    const userPool = new UserPool(this, "Users", {
      userPoolName: "bayledger-users",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
      },
      // custom:role is a signup hint; group membership is what APIs should
      // authorize on. Employee id is not collected here — it belongs on the
      // crew profile in RDS when that slice exists.
      customAttributes: {
        role: new StringAttribute({ minLen: 1, maxLen: 32, mutable: true }),
      },
    });

    // Public SPA client (no client secret). SRP is the browser flow; password
    // is kept for local / tooling. Existence errors are hidden so sign-in
    // cannot be used to probe whether an email is already registered.
    const webClient = userPool.addClient("WebClient", {
      userPoolClientName: "bayledger-web",
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
    });

    // Lower precedence = higher privilege when a user is in both groups.
    new CfnUserPoolGroup(this, "FloorGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "floor",
      description: "Warehouse operators: forklift, line, packaging, and other floor roles",
      precedence: 20,
    });

    new CfnUserPoolGroup(this, "ManagersGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "managers",
      description: "Shift managers who see crew credentials, leave, and assignments",
      precedence: 10,
    });

    const preSignUp = new NodejsFunction(this, "PreSignUp", {
      functionName: "bayledger-auth-pre-sign-up",
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(packages, "auth/src/pre-sign-up.ts"),
      timeout: Duration.seconds(10),
      bundling: {
        externalModules: ["@aws-sdk/*"],
      },
    });

    // Bundles packages/auth. After confirm, it reads custom:role and
    // AdminAddUserToGroup so the ID token carries floor | managers.
    const postConfirmation = new NodejsFunction(this, "PostConfirmation", {
      functionName: "bayledger-auth-post-confirmation",
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(packages, "auth/src/index.ts"),
      timeout: Duration.seconds(15),
      bundling: {
        externalModules: ["@aws-sdk/*"],
      },
    });

    // Scope by account/region, not the pool construct — a pool ARN here
    // would cycle UserPool → trigger Lambda → IAM policy → UserPool.
    postConfirmation.addToRolePolicy(
      new PolicyStatement({
        actions: ["cognito-idp:AdminAddUserToGroup"],
        resources: [
          `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/*`,
        ],
      }),
    );

    userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, preSignUp);
    userPool.addTrigger(UserPoolOperation.POST_CONFIRMATION, postConfirmation);

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: webClient.userPoolClientId });
    new CfnOutput(this, "UserPoolRegion", { value: this.region });
  }
}

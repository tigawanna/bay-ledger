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

    // Directory of crew accounts. Email is the username. After they confirm
    // the verification code, Cognito calls our post-confirmation Lambda.
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
      // custom:employeeId / custom:role on the user record. Role is a hint
      // at signup; group membership is what APIs should actually authorize on.
      customAttributes: {
        employeeId: new StringAttribute({ minLen: 1, maxLen: 64, mutable: true }),
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

    // Bundles packages/auth. After email confirm, it reads custom:role and
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

    userPool.addTrigger(UserPoolOperation.POST_CONFIRMATION, postConfirmation);

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: webClient.userPoolClientId });
    new CfnOutput(this, "UserPoolRegion", { value: this.region });
  }
}

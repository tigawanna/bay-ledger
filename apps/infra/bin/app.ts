#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack.js";

const env = { account: "000000000000", region: "us-east-1" };

const app = new App();

new AuthStack(app, "Auth", { env });

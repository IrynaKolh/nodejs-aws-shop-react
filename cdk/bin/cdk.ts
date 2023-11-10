#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import { StaticWebsite } from "../lib/cdk-stack"
import { config } from "dotenv";

config();

const app = new cdk.App();

class MyStaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    new StaticWebsite(this, "AutoDeployStaticSite")
  }
}

new MyStaticSiteStack(app, "AutoDeployAwsShopReact", {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth()
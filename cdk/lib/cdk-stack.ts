import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs"

export class StaticWebsite extends Construct {
  constructor(parent: cdk.Stack, name: string) {
    super(parent, name)

    const oai = new cdk.aws_cloudfront.OriginAccessIdentity(this, "AwsShopReactOAI", {
      comment: `${name}`,
    })

    const bucket = new cdk.aws_s3.Bucket(this, "AutoDeployAwsShopReact", {
      bucketName: "auto-deploy-aws-shop-react",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    })

    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["S3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new cdk.aws_iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    )

    // TODO: not work access policy, figure out why    
    // const cloudfront = new cdk.aws_cloudfront.Distribution(
    //   this,
    //   "AwsShopReactDistribution",
    //   {
    //     defaultBehavior: {
    //       origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, {
    //         originAccessIdentity: oai,
    //       }),
    //       allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    //       viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //     },
    //     defaultRootObject: "index.html",
    //     errorResponses: [
    //       {
    //         httpStatus: 404,
    //         responseHttpStatus: 200,
    //         responsePagePath: "/index.html",
    //       },
    //     ],
    //   }
    // );

    // https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudfront.CloudFrontWebDistribution.html
    const cloudfront = new cdk.aws_cloudfront.CloudFrontWebDistribution(
      this,
      "AwsShopReactDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
        defaultRootObject: "index.html",
      }
    );


    new cdk.aws_s3_deployment.BucketDeployment(this, "DeployAwsShopReact", {
      sources: [cdk.aws_s3_deployment.Source.asset("../dist")],
      destinationBucket: bucket,
      distribution: cloudfront,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "DomainURL", {
      value: cloudfront.distributionDomainName,
    });
  }
}

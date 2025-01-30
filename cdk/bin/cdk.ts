import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MongoAtlasSlsClusterStack } from '../lib/mongo-sls-basic-stack'
import { EcsBasicStack } from '../lib/ecs-basic-stack'

const app = new cdk.App()

export const SlsClusterStack = new MongoAtlasSlsClusterStack(
  app,
  'QaMongoAtlasSlsClusterStack', {
    env: {
      account: '123456789012',
      region: 'eu-west-1',
    },
    stackName: 'mongo-atlas-sls-cluster',
    environment: 'qa',
    orgId: '12345678900123456',
    // > profile -> refers to API key which has pragmatic access to the atlas.
    profile: 'qa-serverless-cluster',
    projectId: '12345678900123456',
    region: 'EU_WEST_1',
    Ip: '0.0.0.0/1',
});

export const EcsStack = new EcsBasicStack(
  app,
  'QaEcsBasicStack', {
    env: {
      account: '123456789012',
      region: 'eu-west-1',
    },
    stackName: 'qa-abu-ecs-basic',
    environment: 'qa',
    datadogApiKeySecretArn: 'arn:aws:secretsmanager:eu-west-1:123456789012:secret:datadog/api/key-Vxnjwe',
    mongoUriSecretArn: 'arn:aws:secretsmanager:eu-west-1:123456789012:secret:mongo/atlas/serverless-uri-Vxnjwe',
    serviceName: 'abu-basic-ecs',
    vpcName: 'QAGraphqlVpcStack/Vpc',
    ecrRepositoryArn: 'arn:aws:ecr:eu-west-1:123456789012:repository/atlas-serverless',
});

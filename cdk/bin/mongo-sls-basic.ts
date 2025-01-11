import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MongoAtlasSlsClusterStack } from '../lib/mongo-sls-basic-stack'
// import { EcsStack } from '../lib/ecs'

const app = new cdk.App()

export const SlsClusterStack = new MongoAtlasSlsClusterStack(
  app,
  'QaMongoAtlasSlsClusterStack', {
    env: {
      account: '123456789012',
      region: 'eu-west-1',
    },
    stackName: 'qa-abu-mongo-atlas-sls-cluster',
    environment: 'qa',
    orgId: '12345678900123456',
    // > profile -> refers to API key which pragmatic access to the atlas.
    profile: 'qa-serverless-cluster',
    projectId: '12345678900123456',
    region: 'EU_WEST_1',
    Ip: '0.0.0.0/1',
});

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MongoServerlessExampleStack } from '../lib/mongo-serverless-example-stack'

const app = new cdk.App()

export const MongoServerlessStack = new MongoServerlessExampleStack(
  app,
  'MongoServerlessExampleStack', {
    env: {
      account: '1234567890',
      region: 'eu-west-1',
    },
    stackName: 'mongo-serverless-example',
    environment: 'qa',
    orgId: '000000000000000000000000',
    /*
    * > profile which has mongo pragmatic access key (PAKs)
    *   saved in as a key-value pair
    */
    profile: 'mongo-serverless-profile',
    projectId: '111111111111111111111111',
    region: 'EU_WEST_1',
    // open to world
    Ip: '0.0.0.0/1',
})

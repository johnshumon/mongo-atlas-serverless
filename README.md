# Mongo Atlas Serverless

**AWS Fargate + MongoDB Atlas Serverless**

This project showcases a containerized HTTP server deployed on AWS Fargate that connects to MongoDB Atlas using both standard connection string and private endpoints connection string. Entire infrastructure including ECS clusters and MongoDB Atlas resources, is defined as code using AWS CDK, making it easily reproducible and maintainable. A good starting point for anyone looking to create a basic mongo atlas serverless cluster and test it's connectivity with an application.

## Project Structure

- cdk - contains cdk infrastructure code for creating  a mongo atlas serverless cluster and ecs cluster
- src - contains a simple http server that connects to a mongo atlas serverless cluster via `mongo+srv` uri passed as env variable.

### Pre-requisite

- NodeJs (v22 preferred)
- AWS CDK CLI
- Docker (for local development and testing)

### Local Setup

```sh
$ git clone git@github.com:johnshumon/mongo-atlas-serverless.git && cd mongo-atlas-serverless

# Install dependencies
$ yarn install --frozen-lockfile

# Run locally
$ yarn dev

# Move to cdk directory
$ cd cdk

# Install aws-cdk dependencies
$ yarn install --frozen-lockfile
$ uv pip install -r ./cdk/requirements.txt

# Deploy to AWS
$ yarn cdk list
$ yarn cdk synth <stack_name> (e.g. yarn cdk synth QaMongoAtlasSlsClusterStack)
$ yarn cdk deploy <stack_name> (e.g. yarn cdk deploy QaMongoAtlasSlsClusterStack)
```

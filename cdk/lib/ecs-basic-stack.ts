import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_ecs as ecs,
  aws_ecs_patterns as ecs_patterns,
  aws_ecr as ecr,
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
} from 'aws-cdk-lib';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { version } from 'os';

export interface EcsBasicStackProps extends cdk.StackProps {
  environment: string;
  datadogApiKeySecretArn: string;
  mongoUriSecretArn: string;
  ecrRepositoryArn: string;
  serviceName: string;
  vpcName: string;
}

export class EcsBasicStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: EcsBasicStackProps
  ) {
    super(scope, id, props);

    const DATADOG_APM_IMAGETAG = "public.ecr.aws/datadog/agent:latest";
    const DATADOG_PORT = 8126;
    const DATADOG_DOGSTATSD_PORT = 8125;
    const DD_TAGS = [
      `env:${props.environment}`,
      `service:${props.serviceName}`,
      `version:mongo-atlas-sls-latest`,
    ];

    const datadogSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      'DatadogApiKeySecret',
      props.datadogApiKeySecretArn,
    );

    const ecrRepository = ecr.Repository.fromRepositoryArn (
      this,
      'EcrRepository',
      props.ecrRepositoryArn
    );

    const mongoSecretArn = props.mongoUriSecretArn;
    const mongoUri = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      'MongoUriSecret',
      mongoSecretArn,
    );

    // Import existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcName: props.vpcName, // 'QAGraphqlVpcStack/Vpc'
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'BasicEcsCluster', {
      clusterName: `${props.serviceName}-cluster`,
      vpc,
      containerInsights: true,
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Create Fargate Service with ALB
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'BasicEcsService', {
      cluster,
      serviceName: `${props.serviceName}`,
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 1,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      taskImageOptions: {
        containerName: `${id}`,
        image: ecs.ContainerImage.fromEcrRepository(
          ecrRepository,
          'mongo-atlas-sls-latest',
        ),
        containerPort: 4000,
        taskRole,
        enableLogging: true,
        environment: {
          NODE_ENV: `${props.environment}`,
          DD_AGENT_HOST: 'localhost',
          DD_TRACE_AGENT_PORT: `${DATADOG_PORT}`,
          DD_TAGS: DD_TAGS.join(','),
          DD_LOGS_INJECTION: 'true',
          DD_PROFILING_ENABLED: 'true',
          DD_LOGS_ENABLED: 'true',
          MONGO_URI: mongoUri.secretValue.unsafeUnwrap().toString(),
          PORT: '4000',
        },
        logDriver: new ecs.FireLensLogDriver({
          options: {
            Name: 'datadog',
            TLS: 'on',
            provider: 'ecs',
            host: 'http-intake.logs.datadoghq.com',
            dd_source: `${props.serviceName}`,
            dd_service: `${props.serviceName}`,
            dd_tags: DD_TAGS.join(','),
            apiKey: datadogSecret.secretValue.unsafeUnwrap().toString(),
          },
        }),
      },
      publicLoadBalancer: true,
      targetProtocol: ApplicationProtocol.HTTP,
      propagateTags: ecs.PropagatedTagSource.SERVICE,
      enableECSManagedTags: true,
      enableExecuteCommand: true,
      circuitBreaker: {
        rollback: true,
      },
    });

    fargateService.taskDefinition.addFirelensLogRouter("FirelensLogRouter", {
      image: ecs.obtainDefaultFluentBitECRImage(
        fargateService.taskDefinition,
        undefined,
        "stable",
      ),
      essential: false,
      memoryReservationMiB: 256,
      firelensConfig: {
        type: ecs.FirelensLogRouterType.FLUENTBIT,
        options: {
          enableECSLogMetadata: true,
          configFileType: ecs.FirelensConfigFileType.FILE,
          configFileValue: "/fluent-bit/configs/parse-json.conf",
        },
      },
      logging: new ecs.AwsLogDriver({ streamPrefix: "firelens" }),
    });

    const datadogContainer = fargateService.taskDefinition.addContainer('DatadogAgent', {
      image: ecs.ContainerImage.fromRegistry(DATADOG_APM_IMAGETAG),
      secrets: {
        DD_API_KEY: ecs.Secret.fromSecretsManager(datadogSecret),
      },
      environment: {
        ECS_FARGATE: 'true',
        DD_DOGSTATSD_NON_LOCAL_TRAFFIC: 'true',
        DD_APM_ENABLED: 'true',
        DD_APM_NON_LOCAL_TRAFFIC: 'true',
        DD_TAGS: DD_TAGS.join(' ')
      },
      essential: false,
    }); 
    datadogContainer.addPortMappings({ containerPort: DATADOG_PORT });
    datadogContainer.addPortMappings({ containerPort: DATADOG_DOGSTATSD_PORT });

    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
    });

    // Output the Load Balancer DNS
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
    });
  }
}

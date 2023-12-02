// // This CDK L3 example creates a MongoDB Atlas project, cluster, databaseUser, and projectIpAccessList
import { Stack,
  StackProps,
  Tags,
  aws_secretsmanager as secretmanager
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AtlasServerlessBasic, ServerlessInstanceProviderSettingsProviderName } from 'awscdk-resources-mongodbatlas';

export interface AtlasServerlessStackProps extends StackProps {
  readonly environment: string;
  readonly orgId: string;
  readonly profile: string;
  readonly projectId: string;
  readonly region: string;
  readonly Ip: string;
}

export class MongoServerlessExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: AtlasServerlessStackProps) {
    super(scope, id, props);

    Tags.of(this).add('env', props.environment);
    Tags.of(this).add('service', 'mongo-serverless-example');

    new AtlasServerlessBasic(this, 'EntitlementsServerlessMongo', {
      serverlessProps: {
        projectId: props.projectId,
        profile: props.profile,
        continuousBackupEnabled: props.environment === 'qa' ? false : true,
        providerSettings: {
          providerName:
            ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
            regionName: props.region,
        },
        // > name refers to -> database name in mongo console
        name: 'mongo-serverless-example-db',
        terminationProtectionEnabled: true,
      },
      projectProps: {
        orgId: props.orgId,
      },
      profile: props.profile,
      ipAccessListProps: {
        accessList:[{
            ipAddress: props.Ip,
            comment: 'Allowed ip to access'
          }
        ]
      },
    });
  }
}

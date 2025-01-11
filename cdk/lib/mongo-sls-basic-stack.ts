// // This CDK L3 example creates a MongoDB Atlas project, cluster, databaseUser, and projectIpAccessList
import { Stack,
  StackProps,
  Tags
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AtlasServerlessBasic, ServerlessInstanceProviderSettingsProviderName } from 'awscdk-resources-mongodbatlas';

export interface AtlasServerlessStackProps extends StackProps {
  readonly environment: string;
  readonly orgId: string;
  readonly profile: string;
  readonly projectId: string;
  readonly region: string;
  readonly Ip?: string;
  readonly gqlVpcCidr?: string;
}

export class MongoAtlasSlsClusterStack extends Stack {
  constructor(scope: Construct, id: string, props: AtlasServerlessStackProps) {
    super(scope, id, props);

    Tags.of(this).add('env', props.environment);
    Tags.of(this).add('service', 'qa-abu-mongo-atlas-sls');

    new AtlasServerlessBasic(this, 'MongoSlsClusterBasic', {
      serverlessProps: {
        projectId: props.projectId,
        profile: props.profile,
        continuousBackupEnabled: props.environment === 'qa' ? false : true,
        providerSettings: {
          providerName:
            ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
            regionName: props.region,
        },
        // > name refers to -> database cluster name in mongo console
        name: 'bytedb-sls',
        terminationProtectionEnabled: true,
      },
      projectProps: {
        orgId: props.orgId,
      },
      profile: props.profile,
      ipAccessListProps: {
        // access list is a required key to create a serverless cluster
        accessList:[{
            ipAddress: props.Ip || '0.0.0.0/1',
            comment: 'Allowed ip to access'
          }
        ]
      },
    });
  }
}

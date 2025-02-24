import { Card, Text } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import EnvVarService from '@/core/services/EnvVarService';

type Props = {
  source: 'app' | 'workflow';
  sourceId?: string;
};

const EnvVarsTable = ({ source, sourceId }: Props) => {
  const envs = useBitriseYmlStore((state) => {
    if (source === 'app') {
      return state.yml.app?.envs ?? [];
    }

    if (source === 'workflow' && sourceId) {
      return state.yml.workflows?.[sourceId]?.envs ?? [];
    }

    return [];
  }).map((env) => EnvVarService.parseYmlEnvVar(env, sourceId));

  if (!envs.length) {
    return null;
  }

  return (
    <Card variant="outline">
      {envs.map((env, index) => (
        // NOTE: This is necessary because the key is not unique
        // eslint-disable-next-line react/no-array-index-key
        <Text key={`${env.key}-${index}`}>{`$${env.key}: ${env.value}`}</Text>
      ))}
    </Card>
  );
};

export default EnvVarsTable;

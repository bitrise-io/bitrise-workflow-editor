import { useState } from 'react';
import { useTimeout } from 'usehooks-ts';
import { EnvVar } from '@/core/models/EnvVar';

const useEnvVars = (_workflowId: string) => {
  const [envs, setEnvs] = useState<EnvVar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useTimeout(() => {
    setIsLoading(false);
    setEnvs([{ key: 'TEST', value: 'test', source: 'app', isExpand: false }]);
  }, 2000);

  return { isLoading, envs };
};

export default useEnvVars;

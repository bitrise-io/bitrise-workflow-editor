import { useShallow } from 'zustand/react/shallow';
import { BitriseYml } from '@/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  id: string;
};

const extractBeforeRunChain = (yml: BitriseYml, id: string): string[] => {
  const ids = yml.workflows?.[id]?.before_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    return [...mergedIds, ...extractBeforeRunChain(yml, currentId), currentId];
  }, []);
};

const extractAfterRunChain = (yml: BitriseYml, id: string): string[] => {
  const ids = yml.workflows?.[id]?.after_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    return [...mergedIds, currentId, ...extractAfterRunChain(yml, currentId)];
  }, []);
};

export const useBeforeRunWorkflows = ({ id }: Props) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extractBeforeRunChain(yml, id)));
};

export const useAfterRunWorkflows = ({ id }: Props) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extractAfterRunChain(yml, id)));
};

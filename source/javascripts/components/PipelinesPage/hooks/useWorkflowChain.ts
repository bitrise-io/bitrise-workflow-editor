import { useShallow } from 'zustand/react/shallow';
import { BitriseYml } from '../PipelinesPage.types';
import useBitriseYmlStore from './useBitriseYmlStore';

type Props = {
  id: string;
};

const extracBeforeRunChain = (yml: BitriseYml, id: string): string[] => {
  const ids = yml.workflows?.[id]?.before_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    return [...mergedIds, ...extracBeforeRunChain(yml, currentId), currentId];
  }, []);
};

const extracAfterRunChain = (yml: BitriseYml, id: string): string[] => {
  const ids = yml.workflows?.[id]?.after_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    return [...mergedIds, currentId, ...extracAfterRunChain(yml, currentId)];
  }, []);
};

export const useBeforeRunWorkflows = ({ id }: Props) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extracBeforeRunChain(yml, id)));
};

export const useAfterRunWorkflows = ({ id }: Props) => {
  return useBitriseYmlStore(useShallow(({ yml }) => extracAfterRunChain(yml, id)));
};

import { createStore, useStore } from 'zustand';

export const configMergeDialog = createStore(() => ({
  isOpen: false,
  isLoading: false,
  baseYaml: '',
  yourYaml: '',
  finalYaml: '',
  remoteYaml: '',
  errorMessage: '',
}));

export const useConfigMergeDialog = () => {
  return useStore(configMergeDialog);
};

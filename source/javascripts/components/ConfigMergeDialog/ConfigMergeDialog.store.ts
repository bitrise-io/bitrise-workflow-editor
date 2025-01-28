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

type ConfigMergeDialogState = ReturnType<(typeof configMergeDialog)['getState']>;

export function useConfigMergeDialog<U = ConfigMergeDialogState>(selector?: (state: ConfigMergeDialogState) => U) {
  return useStore(configMergeDialog, selector || ((s) => s as U));
}

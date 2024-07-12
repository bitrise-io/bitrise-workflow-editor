export type SearchFormValues = {
  search: string;
};

export const InitialValues: SearchFormValues = {
  search: '',
};

export type ChainWorkflowCallback = (mode: 'before' | 'after', workflowId: string) => void;

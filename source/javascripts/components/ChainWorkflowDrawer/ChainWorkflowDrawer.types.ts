export type SearchFormValues = {
  search: string;
};

export const InitialValues: SearchFormValues = {
  search: '',
};

export type ChainableWorkflow = {
  id: string;
  usedBy: string[];
};

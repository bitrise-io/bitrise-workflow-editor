import { ChainedWorkflowPlacement } from '@/core/models/Workflow';

export type SearchFormValues = {
  search: string;
};

export const InitialValues: SearchFormValues = {
  search: '',
};

export type ChainWorkflowCallback = (
  chainableWorkflowId: string,
  parentWorkflowId: string,
  placement: ChainedWorkflowPlacement,
) => void;

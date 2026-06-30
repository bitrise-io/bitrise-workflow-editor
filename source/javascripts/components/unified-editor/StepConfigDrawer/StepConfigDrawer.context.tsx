import { createContext, useContext } from 'react';

import { Step } from '@/core/models/Step';

export type StepConfigDrawerContextProps = { workflowId: string; stepIndex: number; stepBundleId?: string };
export type StepConfigDrawerState = {
  workflowId: string;
  stepIndex: number;
  isLoading: boolean;
  data?: Step;
  error?: Error;
  stepBundleId?: string;
};

export const initialStepConfigDrawerState: StepConfigDrawerState = {
  error: undefined,
  data: undefined,
  isLoading: true,
  workflowId: '',
  stepBundleId: '',
  stepIndex: -1,
};

export const StepConfigDrawerContext = createContext(initialStepConfigDrawerState);

export const useStepDrawerContext = () => useContext(StepConfigDrawerContext);

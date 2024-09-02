import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useWorkflow from '@/hooks/useWorkflow';
import { Workflow } from '@/core/models/Workflow';
import { FormValues } from './WorkflowConfig.types';

type State = Workflow | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ workflowId: string }>;
const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const workflow = useWorkflow(workflowId);
  const value = useMemo(() => workflow, [workflow]);
  const form = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      properties: {
        name: value?.id ?? '',
        summary: value?.userValues.summary ?? '',
        description: value?.userValues?.description ?? '',
      },
    },
  });

  return (
    <Context.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </Context.Provider>
  );
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default WorkflowConfigProvider;

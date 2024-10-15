import { createContext, PropsWithChildren, useContext, useLayoutEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useWorkflow from '@/hooks/useWorkflow';
import { Workflow } from '@/core/models/Workflow';
import { FormValues } from './WorkflowConfig.types';

type State = Workflow | undefined;
const Context = createContext<State>(undefined);

type Props = PropsWithChildren<{ workflowId: string }>;
const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const workflow = useWorkflow(workflowId);
  const form = useForm<FormValues>({ mode: 'all' });

  useLayoutEffect(() => {
    form.reset({
      properties: {
        name: workflow?.id,
        summary: workflow?.userValues?.summary ?? '',
        description: workflow?.userValues?.description ?? '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  return (
    <Context.Provider value={workflow}>
      <FormProvider {...form}>{children}</FormProvider>
    </Context.Provider>
  );
};

export const useWorkflowConfigContext = () => {
  return useContext<State>(Context);
};

export default WorkflowConfigProvider;

import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useWorkflow from '@/hooks/useWorkflow';
import { FormValues } from './WorkflowConfig.types';

type Props = PropsWithChildren<{ workflowId: string }>;
type State = Exclude<ReturnType<typeof useWorkflow>, undefined>;

const initialState: State = { id: '' };
const Context = createContext<State>(initialState);

const WorkflowConfigProvider = ({ workflowId, children }: Props) => {
  const workflow = useWorkflow(workflowId);
  const value = useMemo(() => workflow ?? initialState, [workflow]);

  const form = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      properties: {
        name: value.id,
        summary: value.summary || '',
        description: value.description || '',
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
  return useContext(Context);
};

export default WorkflowConfigProvider;

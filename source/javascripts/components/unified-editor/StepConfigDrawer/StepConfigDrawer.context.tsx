import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useStep from '@/hooks/useStep';
import { Step } from '@/core/models/Step';
import VersionChangedDialog from '../VersionChangedDialog/VersionChangedDialog';

type Props = { workflowId: string; stepIndex: number };
type State = { workflowId: string; stepIndex: number; isLoading: boolean; data?: Step; error?: Error };

const initialState: State = { error: undefined, data: undefined, isLoading: true, workflowId: '', stepIndex: -1 };
const Context = createContext(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep(workflowId, stepIndex);

  const value = useMemo<State>(() => {
    if (!result) return initialState;
    return { workflowId, stepIndex, ...result } as State;
  }, [result, workflowId, stepIndex]);

  const [newVersion, setNewVersion] = useState<string>();
  const [oldVersion, setOldVersion] = useState<string>();

  useEffect(() => {
    if (!value.isLoading && !newVersion && !oldVersion) {
      setNewVersion(value?.data?.resolvedInfo?.normalizedVersion);
      setOldVersion(value?.data?.resolvedInfo?.normalizedVersion);
    }
  }, [newVersion, oldVersion, value?.data?.resolvedInfo?.normalizedVersion, value.isLoading]);

  useEffect(() => {
    if (newVersion !== value?.data?.resolvedInfo?.normalizedVersion) {
      setNewVersion(value?.data?.resolvedInfo?.normalizedVersion);
    }
  }, [newVersion, value?.data?.resolvedInfo?.normalizedVersion]);

  return (
    <Context.Provider value={value}>
      {children}
      {newVersion && oldVersion && result.data?.cvs && !result.error && (
        <VersionChangedDialog
          cvs={result.data.cvs}
          oldVersion={oldVersion}
          newVersion={newVersion}
          onClose={() => setOldVersion(newVersion)}
        />
      )}
    </Context.Provider>
  );
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);

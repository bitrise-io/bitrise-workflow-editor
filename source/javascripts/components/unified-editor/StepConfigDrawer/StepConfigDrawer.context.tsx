import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { Step } from '@/core/models/Step';
import useStep from '@/hooks/useStep';

import VersionChangedDialog from '../VersionChangedDialog/VersionChangedDialog';

type Props = { workflowId: string; stepIndex: number; stepBundleId?: string };
type State = {
  workflowId: string;
  stepIndex: number;
  isLoading: boolean;
  data?: Step;
  error?: Error;
  stepBundleId?: string;
};

const initialState: State = {
  error: undefined,
  data: undefined,
  isLoading: true,
  workflowId: '',
  stepBundleId: '',
  stepIndex: -1,
};
const Context = createContext(initialState);

const StepConfigDrawerProvider = ({ children, workflowId, stepBundleId, stepIndex }: PropsWithChildren<Props>) => {
  const result = useStep({ workflowId, stepBundleId, stepIndex });

  const value = useMemo<State>(() => {
    if (!result) return initialState;
    return { workflowId, stepBundleId, stepIndex, ...result } as State;
  }, [result, workflowId, stepBundleId, stepIndex]);

  const [newVersion, setNewVersion] = useState(value?.data?.resolvedInfo?.resolvedVersion);
  const [oldVersion, setOldVersion] = useState(value?.data?.resolvedInfo?.resolvedVersion);
  const shouldMountVersionChangedDialog =
    !value.isLoading && !result.error && newVersion && oldVersion && newVersion !== oldVersion;

  useEffect(() => {
    if (newVersion !== value?.data?.resolvedInfo?.resolvedVersion) {
      setNewVersion(value?.data?.resolvedInfo?.resolvedVersion);
    }
  }, [newVersion, value?.data?.resolvedInfo?.resolvedVersion]);

  return (
    <Context.Provider value={value}>
      {children}
      {shouldMountVersionChangedDialog && (
        <VersionChangedDialog
          cvs={result?.data?.cvs || ''}
          oldVersion={oldVersion || ''}
          newVersion={newVersion || ''}
          onClose={() => setOldVersion(newVersion)}
        />
      )}
    </Context.Provider>
  );
};

export default StepConfigDrawerProvider;

export const useStepDrawerContext = () => useContext(Context);

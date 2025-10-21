import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { Step } from '@/core/models/Step';
import useStep from '@/hooks/useStep';

import VersionChangedDialog from '../VersionChangedDialog/VersionChangedDialog';

type Props = { parentWorkflowId: string; stepIndex: number; parentStepBundleId?: string };
type State = {
  parentWorkflowId: string;
  stepIndex: number;
  isLoading: boolean;
  data?: Step;
  error?: Error;
  parentStepBundleId?: string;
};

const initialState: State = {
  error: undefined,
  data: undefined,
  isLoading: true,
  parentWorkflowId: '',
  parentStepBundleId: '',
  stepIndex: -1,
};
const Context = createContext(initialState);

const StepConfigDrawerProvider = ({
  children,
  parentWorkflowId,
  parentStepBundleId,
  stepIndex,
}: PropsWithChildren<Props>) => {
  const result = useStep({ parentWorkflowId, parentStepBundleId, stepIndex });

  const value = useMemo<State>(() => {
    if (!result) return initialState;
    return { parentWorkflowId, parentStepBundleId, stepIndex, ...result } as State;
  }, [result, parentWorkflowId, parentStepBundleId, stepIndex]);

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

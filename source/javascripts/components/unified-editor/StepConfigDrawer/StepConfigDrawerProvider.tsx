import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import useStep from '@/hooks/useStep';

import VersionChangedDialog from '../VersionChangedDialog/VersionChangedDialog';
import {
  initialStepConfigDrawerState,
  StepConfigDrawerContext,
  StepConfigDrawerContextProps,
  StepConfigDrawerState,
} from './StepConfigDrawer.context';

const StepConfigDrawerProvider = ({
  children,
  workflowId,
  stepBundleId,
  stepIndex,
}: PropsWithChildren<StepConfigDrawerContextProps>) => {
  const result = useStep({ workflowId: stepBundleId ? undefined : workflowId, stepBundleId, stepIndex });

  const value = useMemo<StepConfigDrawerState>(() => {
    if (!result) return initialStepConfigDrawerState;
    return { workflowId, stepBundleId, stepIndex, ...result } as StepConfigDrawerState;
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
    <StepConfigDrawerContext.Provider value={value}>
      {children}
      {shouldMountVersionChangedDialog && (
        <VersionChangedDialog
          cvs={result?.data?.cvs || ''}
          oldVersion={oldVersion || ''}
          newVersion={newVersion || ''}
          onClose={() => setOldVersion(newVersion)}
        />
      )}
    </StepConfigDrawerContext.Provider>
  );
};

export default StepConfigDrawerProvider;

import { PropsWithChildren } from 'react';

import StepConfigDrawerProvider from '../StepConfigDrawer/StepConfigDrawerProvider';
import { StepBundleConfigContext, StepBundleConfigContextValue } from './StepBundleConfig.context';

const StepBundleConfigProvider = ({ children, ...props }: PropsWithChildren<StepBundleConfigContextValue>) => {
  return (
    <StepConfigDrawerProvider stepBundleId={props.stepBundleId} workflowId="" stepIndex={props.stepIndex}>
      <StepBundleConfigContext.Provider value={props}>{children}</StepBundleConfigContext.Provider>
    </StepConfigDrawerProvider>
  );
};

export default StepBundleConfigProvider;

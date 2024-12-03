import { memo } from 'react';

import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';

import StepService from '@/core/models/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

import StepCard, { StepCardProps } from './StepCard';

const StepListItem = (props: StepCardProps) => {
  const { stepBundleId, stepIndex, workflowId = '', ...rest } = props;

  const cvs = useBitriseYmlStore((s) => {
    return Object.keys(s.yml.workflows?.[workflowId]?.steps?.[stepIndex] ?? {})[0];
  });

  const defaultStepLibrary = useDefaultStepLibrary();
  const isStepBundle = StepService.isStepBundle(cvs, defaultStepLibrary);

  if (isStepBundle && stepBundleId) {
    return <StepBundleCard stepBundleId={stepBundleId} isCollapsable />;
  }

  return <StepCard stepIndex={stepIndex} stepBundleId={stepBundleId} workflowId={workflowId} {...rest} />;
};

export default memo(StepListItem);

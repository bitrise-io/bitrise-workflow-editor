import { memo } from 'react';

import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import StepService from '@/core/models/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import useFeatureFlag from '@/hooks/useFeatureFlag';

import StepCard, { StepCardProps } from './StepCard';

const StepListItem = (props: StepCardProps) => {
  const { stepBundleId, stepIndex, workflowId = '', ...rest } = props;
  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui');

  const cvs = useBitriseYmlStore((s) => {
    return Object.keys(s.yml.workflows?.[workflowId]?.steps?.[stepIndex] ?? {})[0];
  });

  const defaultStepLibrary = useDefaultStepLibrary();

  if (!cvs) {
    return null;
  }

  const isStepBundle = StepService.isStepBundle(cvs, defaultStepLibrary);

  if (enableStepBundles && isStepBundle) {
    return <StepBundleCard isCollapsable id={cvs.replace('bundle::', '')} />;
  }

  return <StepCard stepIndex={stepIndex} stepBundleId={stepBundleId} workflowId={workflowId} {...rest} />;
};

export default memo(StepListItem);

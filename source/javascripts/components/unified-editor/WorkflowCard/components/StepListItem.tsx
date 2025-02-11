/* eslint-disable import/no-cycle */
import { memo } from 'react';

import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import StepBundleCard from '../../StepSelectorDrawer/components/StepBundleCard';

import StepCard, { StepCardProps } from './StepCard';

const StepListItem = (props: StepCardProps) => {
  const { cvs, stepIndex, workflowId = '', ...rest } = props;

  const defaultStepLibrary = useDefaultStepLibrary();

  if (!cvs) {
    return null;
  }

  const isStepBundle = StepService.isStepBundle(cvs, defaultStepLibrary);

  if (isStepBundle) {
    return <StepBundleCard isCollapsable cvs={cvs} stepIndex={stepIndex} workflowId={workflowId} {...rest} />;
  }

  return <StepCard cvs={cvs} stepIndex={stepIndex} workflowId={workflowId} {...rest} />;
};

export default memo(StepListItem);

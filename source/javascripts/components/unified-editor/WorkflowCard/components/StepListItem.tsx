/* eslint-disable import/no-cycle */
import { memo } from 'react';

import StepService from '@/core/services/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import StepBundleCard from '../../StepSelectorDrawer/components/StepBundleCard';

import StepCard, { StepCardProps } from './StepCard';

const StepListItem = (props: StepCardProps) => {
  const { cvs, ...rest } = props;

  const defaultStepLibrary = useDefaultStepLibrary();

  if (!cvs) {
    return null;
  }

  const isStepBundle = StepService.isStepBundle(cvs, defaultStepLibrary);

  if (isStepBundle) {
    return <StepBundleCard isCollapsable cvs={cvs} {...rest} />;
  }

  return <StepCard cvs={cvs} {...rest} />;
};

export default memo(StepListItem);

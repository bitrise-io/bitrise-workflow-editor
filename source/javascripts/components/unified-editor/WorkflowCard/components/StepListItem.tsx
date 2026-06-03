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
    // The bundle may be defined in another module file (a cross-file
    // reference). StepBundleCard tolerates a missing definition: it renders the
    // instance-level properties from the active file and simply shows no nested
    // steps / container references for the (absent) definition. The drawer's
    // header exposes the jump-to-definition affordance.
    return <StepBundleCard isCollapsable cvs={cvs} {...rest} />;
  }

  return <StepCard cvs={cvs} {...rest} />;
};

export default memo(StepListItem);

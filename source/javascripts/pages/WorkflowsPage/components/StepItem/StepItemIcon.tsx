import { LazyLoadImage } from 'react-lazy-load-image-component';

import defaultStepIcon from '@/../images/step/icon-default.svg';

type StepItemIconProps = {
  iconUrl?: string;
};

const StepItemIcon = ({ iconUrl }: StepItemIconProps): JSX.Element => (
  <LazyLoadImage wrapperProps={{ style: { flexShrink: 0 } }} effect="blur" src={iconUrl || defaultStepIcon} />
);

export default StepItemIcon;

import { LazyLoadImage } from "react-lazy-load-image-component";

import defaultStepIcon from "../../../images/step/icon-default.svg";
import { Step } from "../../models";

export const normalizeIconUrl = (step?: Step): string | undefined => {
	if (!step) {
		return;
	}

	const stepIconURL = step.iconURL();
	return stepIconURL || defaultStepIcon;
};

type StepItemIconProps = {
	step: Step;
};

const StepItemIcon = ({ step }: StepItemIconProps): JSX.Element => (
	<LazyLoadImage wrapperProps={{ style: { flexShrink: 0 } }} effect="blur" src={normalizeIconUrl(step)} />
);

export default StepItemIcon;

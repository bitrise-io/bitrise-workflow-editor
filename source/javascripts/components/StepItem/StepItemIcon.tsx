import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Step } from "../../models";

import defaultStepIcon from "../../../images/step/icon-default.svg";

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
	<LazyLoadImage className="icon" effect="blur" src={normalizeIconUrl(step)} />
);

export default StepItemIcon;

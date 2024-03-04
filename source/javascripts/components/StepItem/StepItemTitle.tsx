import { Text, TextProps } from "@bitrise/bitkit";

import { Step } from "../../models";

type StepItemTitleProps = {
	step: Step;
} & TextProps;

const StepItemTitle = ({ step, ...rest }: StepItemTitleProps): JSX.Element => (
	<Text data-e2e-tag="step-item__title" className="title" hasEllipsis {...rest}>
		{step.displayName()}
	</Text>
);

export default StepItemTitle;

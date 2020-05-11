import React, { FC } from "react";
import { Base, Flex, Icon } from "@bitrise/bitkit";
import MarkdownText from "../MarkdownText";
import { Step } from "../../models";

import StepItemBadge from "./StepItemBadge";
import StepItemIcon from "./StepItemIcon";
import StepItemTitle from "./StepItemTitle";

type AddStepItemProps = {
	step: Step;
	onSelected: (step: Step) => void;
};

const AddStepItem: FC<AddStepItemProps> = ({ step, onSelected }: AddStepItemProps) => (
	<Base clickable={true} className="step">
		<button className="select" onClick={() => onSelected(step)}>
			<Icon name="PlusOpen" />
			<Flex className="step-content" direction="horizontal" overflow="hidden" shrink="x1">
				<StepItemIcon step={step} />
				<Flex grow="x1" shrink="x1" direction="vertical" className="details" overflow="hidden">
					<StepItemTitle step={step} style={{ fontWeight: "900", flexShrink: 0 }} />
					<StepItemBadge step={step} />
					<MarkdownText className="summary" markdown={step.summary()} />
				</Flex>
			</Flex>
		</button>
	</Base>
);

export default AddStepItem;

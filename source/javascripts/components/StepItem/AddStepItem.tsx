import React, { FC } from "react";
import { Base, Icon, Flex } from "@bitrise/bitkit";
import { LazyLoadImage } from "react-lazy-load-image-component";

import MarkdownText from "../MarkdownText";
import { normalizeIconUrl } from "./StepItem";

import { Step } from "../../models";

type AddStepItemProps = {
	step: Step;
	onSelected: (step: Step) => void;
};

const AddStepItem: FC<AddStepItemProps> = ({ step, onSelected }: AddStepItemProps) => (
	<Base clickable={true} className="step">
		<button className="select" onClick={() => onSelected(step)}>
			<Icon name="PlusOpen" />
			<Flex className="step-content" direction="horizontal" overflow="hidden" shrink="x1">
				<LazyLoadImage className="icon" effect="blur" src={normalizeIconUrl(step)} />
				<Flex grow="x1" shrink="x1" direction="vertical" className="details" overflow="hidden">
					<h4>
						<Base Component="span">{step.displayName()}</Base>
					</h4>
					{step.isVerified() && (
						<Base title="Verified step">
							<Icon name="StepThirdParty" color="blue-3" />
						</Base>
					)}
					{step.isOfficial() && (
						<Base title="Official step">
							<Icon name="BitriseCertified" color="aqua-3" />
						</Base>
					)}
					<MarkdownText className="summary" markdown={step.summary()} />
				</Flex>
			</Flex>
		</button>
	</Base>
);

export default AddStepItem;

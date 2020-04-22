import React, { FC } from "react";
import { Base, Icon, Flex } from "@bitrise/bitkit";
import { LazyLoadImage } from "react-lazy-load-image-component";

import MarkdownText from "../MarkdownText";
import { normalizeIconUrl } from "./StepItem";

import { Step } from "../../models";

import verifiedIcon from "../../../images/step/badge-verified.svg";
import communityCreatedIcon from "../../../images/step/badge-community_created.svg";

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
						{step.isVerified() && <img className="verified" src={verifiedIcon} />}
						{!step.isVerified() && <img className="community-created" src={communityCreatedIcon} />}
					</h4>
					<MarkdownText className="summary" markdown={step.summary()} />
				</Flex>
			</Flex>
		</button>
	</Base>
);

export default AddStepItem;

import React, { FC } from "react";
import { Base, Icon } from "@bitrise/bitkit";
import { LazyLoadImage } from "react-lazy-load-image-component";

import MarkdownText from "../MarkdownText";
import { normalizeIconUrl } from "./StepItem";

import { Step } from "../../models";

import defaultStepIcon from "../../../images/step/icon-default.svg";
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
			<Base className="step-content">
				<LazyLoadImage className="icon" effect="blur" src={normalizeIconUrl(step)} placeholderSrc={defaultStepIcon} />
				<Base className="details">
					<h4>
						<span>{step.displayName()}</span>
						{step.isVerified() && <img className="icon verified" src={verifiedIcon} />}
						{!step.isVerified() && <img className="icon community-created" src={communityCreatedIcon} />}
					</h4>
					<MarkdownText markdown={step.summary()} />
				</Base>
			</Base>
		</button>
	</Base>
);

export default AddStepItem;

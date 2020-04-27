import React, { FC } from "react";
import { Base, Text, Badge, Icon } from "@bitrise/bitkit";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Step } from "../../models";

import "./StepItem.scss";
import "react-lazy-load-image-component/src/effects/blur.css";

import defaultStepIcon from "../../../images/step/icon-default.svg";
import deprecatedIcon from "../../../images/step/badge-deprecated.svg";

type StringProps = {
	alwaysLatest: string;
};

type StepItemProps = {
	step: Step;
	title: string;
	version: string;
	strings: StringProps;
	selected: boolean;
	highlightVersionUpdate: boolean;
	stepIndex: number;
	onSelected: (step: Step, index: number) => void;
};

export const normalizeIconUrl = (step?: Step): string | undefined => {
	if (!step) {
		return;
	}

	const stepIconURL = step.iconURL();
	return stepIconURL || defaultStepIcon;
};

const tabIndex = (selected: boolean): number => (selected ? -1 : 0);

const stepVersion = (step: Step, highlightVersionUpdate: boolean): JSX.Element =>
	highlightVersionUpdate ? (
		<Text>{step.version}</Text>
	) : (
		<Badge backgroundColor="red-3" color="white" data-e2e-tag="version-update">
			<Icon name="ArrowUp" />
			{step.version}
		</Badge>
	);

const StepItem: FC<StepItemProps> = ({
	step,
	title,
	version,
	strings,
	selected,
	highlightVersionUpdate,
	stepIndex,
	onSelected
}: StepItemProps) => (
	<button className="step" tabIndex={tabIndex(selected)} onClick={() => onSelected(step, stepIndex)}>
		<LazyLoadImage className="icon" effect="blur" src={normalizeIconUrl(step)} />
		<span className="info">
			<strong>
				<Text className="title" ellipsis>
					{title}
				</Text>
				{step.isVerified() && (
					<Base title="Verified step" paddingHorizontal="x1" data-e2e-tag="verified-badge">
						<Icon name="StepThirdParty" color="blue-3" />
					</Base>
				)}
				{step.isOfficial() && (
					<Base title="Bitrise step" paddingHorizontal="x1" data-e2e-tag="official-badge">
						<Icon name="BitriseCertified" color="aqua-3" />
					</Base>
				)}
				{step.isDeprecated() && <img className="deprecated" src={deprecatedIcon} />}
			</strong>
			<em className="version">
				{version ? (
					stepVersion(step, highlightVersionUpdate)
				) : (
					<Text>{strings.alwaysLatest + (version ? ` (${version})` : "")}</Text>
				)}
			</em>
		</span>
	</button>
);

export default StepItem;

import React, { FunctionComponent } from "react";
import { Text, Badge, Icon } from "@bitrise/bitkit";
import { Step } from "../../models";

import "./StepItem.scss";

// @ts-ignore
import defaultStepIcon from "../../../images/step/icon-default.svg";
// @ts-ignore
import verifiedIcon from "../../../images/step/badge-verified.svg";
// @ts-ignore
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

const stepVersion = (step: Step, highlightVersionUpdate: boolean) =>
	highlightVersionUpdate ? (
		<Text>{step.version}</Text>
	) : (
		<Badge backgroundColor="red-3" color="white">
			<Icon name="ArrowUp" />
			{step.version}
		</Badge>
	);

const StepItem: FunctionComponent<StepItemProps> = ({
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
		<img className="icon" src={normalizeIconUrl(step)} />
		<span className="info">
			<strong>
				<Text className="title" ellipsis>
					{title}
				</Text>
				{step.isVerified() && <img className="verified" src={verifiedIcon} />}
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

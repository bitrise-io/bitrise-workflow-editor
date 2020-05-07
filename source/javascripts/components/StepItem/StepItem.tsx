import React, { FC } from "react";
import { Base, Text, Badge, Icon, Flex, Tooltip } from "@bitrise/bitkit";
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
	displayName: string;
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
		<Badge backgroundColor="red-3" color="white" data-e2e-tag="step-item__update-indicator">
			<Icon name="ArrowUp" />
			{step.version}
		</Badge>
	);

const StepItem: FC<StepItemProps> = ({
	step,
	displayName,
	version,
	strings,
	selected,
	highlightVersionUpdate,
	stepIndex,
	onSelected
}: StepItemProps) => (
	<Tooltip title={step.displayTooltip()} timeout={0} style={{ whiteSpace: "pre-line" }}>
		{({...rest}) => (
			<button {...rest} 
				data-e2e-tag="step-item"
				className="step" tabIndex={tabIndex(selected)} onClick={() => onSelected(step, stepIndex)}>
				<LazyLoadImage className="icon" effect="blur" src={normalizeIconUrl(step)} />
				<span className="info">
					<strong>
						<Text className="title" ellipsis>
							{displayName}
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
						{step.isDeprecated() && (
							<Flex
								title="Deprecated step"
								direction="horizontal"
								alignChildrenVertical="middle"
								data-e2e-tag="deprecated-badge"
							>
								<img className="deprecated" src={deprecatedIcon} />
							</Flex>
						)}
					</strong>
					<em className="version" data-e2e-tag="step-item__version">
						{version ? (
							stepVersion(step, highlightVersionUpdate)
						) : (
							<Text>{strings.alwaysLatest + (version ? ` (${version})` : "")}</Text>
						)}
					</em>
				</span>
			</button>
		)}
	</Tooltip>
);

export default StepItem;

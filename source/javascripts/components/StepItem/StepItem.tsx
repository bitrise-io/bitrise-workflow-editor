import React, { FC } from "react";
import { Tooltip } from "@bitrise/bitkit";
import { Step } from "../../models";

import "./StepItem.scss";
import "react-lazy-load-image-component/src/effects/blur.css";

import StepItemIcon from "./StepItemIcon";
import StepItemBadge from "./StepItemBadge";
import StepItemTitle from "./StepItemTitle";
import StepItemVersion from "./StepItemVersion";

type StringProps = {
	alwaysLatest: string;
};

type StepItemProps = {
	step: Step;
	version: string;
	strings: StringProps;
	selected: boolean;
	highlightVersionUpdate: boolean;
	stepIndex: number;
	onSelected: (step: Step, index: number) => void;
};

const tabIndex = (selected: boolean): number => (selected ? -1 : 0);

const StepItem: FC<StepItemProps> = ({
	step,
	version,
	strings,
	selected,
	highlightVersionUpdate,
	stepIndex,
	onSelected
}: StepItemProps) => (
		<Tooltip title={step.displayTooltip()} timeout={0} style={{ whiteSpace: "pre-line" }}>
			{({ ...rest }) => (
				<button {...rest}
					data-e2e-tag="step-item"
					className="step" tabIndex={tabIndex(selected)} onClick={() => onSelected(step, stepIndex)}>
					<StepItemIcon step={step} />
					<span className="info">
						<strong>
							<StepItemTitle step={step} />
							<StepItemBadge step={step} />
						</strong>
						<StepItemVersion
							step={step}
							version={version}
							highlightVersionUpdate={highlightVersionUpdate}
							strings={strings} />
					</span>
				</button>
			)}
		</Tooltip>
	);

export default StepItem;

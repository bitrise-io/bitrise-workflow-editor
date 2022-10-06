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

const StepItem = ({
	step,
	version,
	strings,
	selected,
	highlightVersionUpdate,
	stepIndex,
	onSelected
}: StepItemProps): JSX.Element => (
		<Tooltip label={step.displayTooltip()} style={{ whiteSpace: "pre-line" }}>
			<button
				type="button"
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
		</Tooltip>
);

export default StepItem;

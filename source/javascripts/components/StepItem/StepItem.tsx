import { Tooltip } from "@bitrise/bitkit";
import { Step } from "../../models";

import "./StepItem.scss";
import "react-lazy-load-image-component/src/effects/blur.css";

import StepItemIcon from "./StepItemIcon";
import StepItemVersion from "./StepItemVersion";
import StepItemBadge from "./StepItemBadge";
import StepItemTitle from "./StepItemTitle";

type StepItemProps = {
	workflowIndex: number;
	step: Step;
	title: string;
	version?: string;
	isSelected: boolean;
	hasVersionUpdate: boolean;
	onSelected: (step: Step, index: number) => void;
};

const tabIndex = (selected: boolean): number => (selected ? -1 : 0);

const StepItem = ({
	workflowIndex,
	step,
	title,
	version,
	hasVersionUpdate,
	isSelected,
	onSelected,
}: StepItemProps): JSX.Element => {
	return (
		<Tooltip label={step.displayTooltip()} style={{ whiteSpace: "pre-line" }}>
			<button
				type="button"
				data-e2e-tag="step-item"
				className="step"
				tabIndex={tabIndex(isSelected)}
				onClick={() => onSelected(step, workflowIndex)}
			>
				<StepItemIcon iconUrl={step.iconURL()} />
				<span className="info">
					<strong>
						<StepItemTitle displayName={title} />
						<StepItemBadge
							isOfficial={step.isOfficial()}
							isVerified={step.isVerified()}
							isDeprecated={step.isDeprecated()}
						/>
					</strong>
					<StepItemVersion
						actualVersion={step.version}
						requestedVersion={version || ""}
						hasVersionUpdate={hasVersionUpdate}
					/>
				</span>
			</button>
		</Tooltip>
	);
};

export default StepItem;

import { Box, Icon } from "@bitrise/bitkit";
import MarkdownText from "../MarkdownText";
import { Step } from "../../models";

import StepItemBadge from "./StepItemBadge";
import StepItemIcon from "./StepItemIcon";
import StepItemTitle from "./StepItemTitle";

type AddStepItemProps = {
	step: Step;
	onSelected: (step: Step) => void;
	disabled: boolean;
};

const AddStepItem = ({ step, disabled = false, onSelected }: AddStepItemProps): JSX.Element => (
	<Box cursor="pointer" className="step" filter={disabled ? "saturate(0)" : undefined}>
		<button className="select" disabled={disabled} onClick={() => onSelected(step)}>
			<Icon className="icon" name="PlusOpen" />
			<Box className="step-content" display="flex" flexDirection="row" overflow="hidden" flexShrink="1" minWidth="0">
				<StepItemIcon step={step} />
				<Box
					display="flex"
					flexGrow="1"
					flexShrink="1"
					minWidth="0"
					flexDirection="column"
					className="details"
					overflow="hidden"
				>
					<StepItemTitle step={step} style={{ fontWeight: "900", flexShrink: 0 }} />
					<StepItemBadge step={step} />
					<MarkdownText className="summary" markdown={step.summary()} />
				</Box>
			</Box>
		</button>
	</Box>
);

export default AddStepItem;

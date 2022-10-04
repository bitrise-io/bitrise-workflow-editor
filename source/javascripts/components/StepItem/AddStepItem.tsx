import { Box, Icon } from "@bitrise/bitkit";
import MarkdownText from "../MarkdownText";
import { Step } from "../../models";

import StepItemBadge from "./StepItemBadge";
import StepItemIcon from "./StepItemIcon";
import StepItemTitle from "./StepItemTitle";

type AddStepItemProps = {
	step: Step;
	onSelected: (step: Step) => void;
};

const AddStepItem = ({ step, onSelected }: AddStepItemProps): JSX.Element => (
	<Box cursor="pointer" className="step">
		<button className="select" onClick={() => onSelected(step)}>
			<Icon name="PlusOpen" />
			<Box className="step-content" display="flex" flexDirection="row" overflow="hidden" flexShrink="1" minWidth="0">
				<StepItemIcon step={step} />
				<Box display="flex" flexGrow="1" flexShrink="1" minWidth="0" flexDirection="row" className="details" overflow="hidden">
					<StepItemTitle step={step} style={{ fontWeight: "900", flexShrink: 0 }} />
					<StepItemBadge step={step} />
					<MarkdownText className="summary" markdown={step.summary()} />
				</Box>
			</Box>
		</button>
	</Box>
);

export default AddStepItem;

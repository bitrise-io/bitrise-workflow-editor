import { Box, Text } from "@bitrise/bitkit";
import { Step } from "../models";

type Props = {
	step: Step;
};

const StepConfiguration = ({ step }: Props) => {
	return (
		<Box display="flex" flexDirection="column" p="24" gap="24">
			<Text>Configuration</Text>
			{step.displayName()}
		</Box>
	);
};

export default StepConfiguration;

import { Box, Text } from "@bitrise/bitkit";

import { Step } from "../models";

type StepPropertiesProps = {
	step: Step;
};

const StepProperties = ({ step }: StepPropertiesProps) => {
	return (
		<Box display="flex" flexDirection="column" p="24" gap="24">
			<Text>Properties</Text>
			{step.displayName()}
		</Box>
	);
};

export default StepProperties;

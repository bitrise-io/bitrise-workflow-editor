import { Step } from "../models";
import { Box, Text } from "@bitrise/bitkit";

type StepOutputVariablesProps = {
  step: Step;
};

const StepOutputVariables = ({ step }: StepOutputVariablesProps) => {
  return (
    <Box display="flex" flexDirection="column" p="24" gap="24">
      <Text>Output variables</Text>
      {step.displayName()}
    </Box>
  );
};

export default StepOutputVariables;

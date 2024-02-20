import { Box, Card, Divider, ExpandableCard, Text, Toggle } from "@bitrise/bitkit";

import { Step } from "../../models";
import StepInput from "./components/StepInput";
import StepInputList from "./components/StepInputList";
import { createKey, groupInputsIntoCategories, mergeDefaultAndUserStepConfig } from "./utils";

type StepConfigurationProps = {
	step: Step;
};

const StepConfiguration = ({ step }: StepConfigurationProps) => {
	const config = mergeDefaultAndUserStepConfig(step);
	const groups = Array.from(groupInputsIntoCategories(config.inputs));

	return (
		<Box display="flex" flexDir="column" p="12" gap="12">
			<ExpandableCard buttonContent={<Text fontWeight="demiBold">When to run</Text>} isExpanded>
				<Box display="flex">
					<Text flex="1">Run if previous Step(s) failed</Text>
					<Toggle defaultChecked={config.is_always_run} />
				</Box>
				<Divider my="24" />
				<StepInput label="Additional run conditions" name="run_if" defaultValue={config.run_if} />
			</ExpandableCard>

			{groups.map(([groupName, inputs], index) => {
				const key = createKey(config.title, config.version, groupName || "group", index);

				if (!groupName) {
					return (
						<Card key={key} variant="outline" p="16">
							<StepInputList inputs={inputs} />
						</Card>
					);
				}

				return (
					<ExpandableCard key={key} buttonContent={<Text fontWeight="demiBold">{groupName}</Text>}>
						<StepInputList inputs={inputs} />
					</ExpandableCard>
				);
			})}
		</Box>
	);
};

export default StepConfiguration;

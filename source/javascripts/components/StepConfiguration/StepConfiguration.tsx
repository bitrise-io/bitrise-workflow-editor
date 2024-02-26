import { Box, Card, Divider, ExpandableCard, Text, Toggle } from "@bitrise/bitkit";
import { ChangeEventHandler, FocusEvent } from "react";

import { InputCategory, Step, Variable } from "../../models";
import StepInput from "./components/StepInput";
import StepInputList from "./components/StepInputList";

type StepConfigurationProps = {
	step: Step;
	inputCategories: InputCategory[];
	onBlur: (e: FocusEvent, input: Variable) => void;
	onClickInsertSecret: (input: Variable) => void;
	onClickInsertVariable: (input: Variable) => void;
};

const StepConfiguration = ({
	step,
	inputCategories,
	onBlur,
	onClickInsertSecret,
	onClickInsertVariable,
}: StepConfigurationProps) => {
	const onChangeAlwaysRun: ChangeEventHandler<HTMLInputElement> = (e) => {
		step.isAlwaysRun(e.target.checked);
	};

	const runIfInput: Variable = {
		value: (newValue?: string) => (newValue !== undefined ? step.runIf(newValue) : step.runIf()),
		title: () => "Additional run conditions",
		isRequired: () => false,
		isSensitive: () => false,
		valueOptions: () => undefined,
		isDontChangeValue: () => false,
	};

	return (
		<Box display="flex" flexDir="column" p="12" gap="12">
			<ExpandableCard buttonContent={<Text fontWeight="demiBold">When to run</Text>} isExpanded>
				<Box display="flex">
					<Text flex="1">Run if previous Step(s) failed</Text>
					<Toggle defaultChecked={step.isAlwaysRun()} onChange={onChangeAlwaysRun} />
				</Box>
				<Divider my="24" />
				<StepInput
					input={runIfInput}
					onBlur={onBlur}
					onClickInsertSecret={onClickInsertSecret}
					onClickInsertVariable={onClickInsertVariable}
				/>
			</ExpandableCard>

			{inputCategories.map((category, index) => {
				const key = [step.displayName(), category.name || "group", index].join("");

				if (!category.name) {
					return (
						<Card key={key} variant="outline" p="16">
							<StepInputList
								inputs={category.inputs}
								onBlur={onBlur}
								onClickInsertSecret={onClickInsertSecret}
								onClickInsertVariable={onClickInsertVariable}
							/>
						</Card>
					);
				}

				return (
					<ExpandableCard key={key} buttonContent={<Text fontWeight="demiBold">{category.name}</Text>}>
						<StepInputList
							inputs={category.inputs}
							onBlur={onBlur}
							onClickInsertSecret={onClickInsertSecret}
							onClickInsertVariable={onClickInsertVariable}
						/>
					</ExpandableCard>
				);
			})}
		</Box>
	);
};

export default StepConfiguration;

import { Avatar, Box, ButtonGroup, Icon, IconButton, Tab, TabList, Tabs, Text, Tooltip } from "@bitrise/bitkit";

import { TabPanel, TabPanels } from "@chakra-ui/react";
import { OnStepPropertyChange, Step, StepOutputVariable, StepVersionWithRemark } from "../models";
import StepItemBadge from "./StepItem/StepItemBadge";
import StepConfiguration from "./StepConfiguration";
import StepProperties from "./StepProperties/StepProperties";
import StepOutputVariables from "./StepOutputVariables";

type Props = {
	step: Step;
	hasVersionUpdate?: boolean;
	versionsWithRemarks: Array<StepVersionWithRemark>;
	outputVariables: Array<StepOutputVariable>;
	onChange: OnStepPropertyChange;
	onClone: VoidFunction;
	onRemove: VoidFunction;
};

const StepConfig = ({
	step,
	hasVersionUpdate,
	versionsWithRemarks,
	outputVariables,
	onChange,
	onClone,
	onRemove,
}: Props): JSX.Element => {
	const showOutputVariables = step.isConfigured() && outputVariables.length > 0;

	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Box as="header" display="flex" px="24" pt="24" gap="16">
				<Avatar name="ci" size="48" src={step.iconURL()} />

				<Box flex="1" minW={0}>
					<Box display="flex" gap="4" alignItems="center">
						<Text size="4" fontWeight="bold" hasEllipsis>
							{step.displayName()}
						</Text>
						<StepItemBadge
							isOfficial={step.isOfficial()}
							isVerified={step.isVerified()}
							isDeprecated={step.isDeprecated()}
						/>
					</Box>

					<Box display="flex" gap="4" alignItems="center">
						<Text size="2" color="text.secondary">
							{step.version || step.defaultStepConfig.version}
						</Text>
						{hasVersionUpdate && (
							<Tooltip
								isDisabled={!hasVersionUpdate}
								label="Major version change. Click to update to the latest version."
							>
								<Icon
									size="16"
									name="WarningColored"
									aria-label="New version available"
									cursor="pointer"
									onClick={() => onChange({ version: "" })}
								/>
							</Tooltip>
						)}
					</Box>
				</Box>

				<ButtonGroup>
					<IconButton
						onClick={onClone}
						size="sm"
						variant="secondary"
						iconName="Duplicate"
						aria-label="Clone this step"
					/>
					<IconButton
						onClick={onRemove}
						size="sm"
						variant="secondary"
						iconName="MinusRemove"
						aria-label="Remove this step"
						isDanger
					/>
				</ButtonGroup>
			</Box>

			<Tabs>
				<TabList paddingX="8">
					<Tab id="configuration">Configuration</Tab>
					<Tab id="properties">Properties</Tab>
					{showOutputVariables && <Tab id="output-variables">Output variables</Tab>}
				</TabList>
				<TabPanels>
					<TabPanel id="configuration">
						<StepConfiguration step={step} />
					</TabPanel>
					<TabPanel id="properties">
						<StepProperties step={step} versionsWithRemarks={versionsWithRemarks} onChange={onChange} />
					</TabPanel>
					{showOutputVariables && (
						<TabPanel id="output-variables">
							<StepOutputVariables outputVariables={outputVariables} />
						</TabPanel>
					)}
				</TabPanels>
			</Tabs>
		</Box>
	);
};

export default StepConfig;

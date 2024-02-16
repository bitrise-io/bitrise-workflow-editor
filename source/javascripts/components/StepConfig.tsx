import {
  Avatar,
  Box,
  ButtonGroup,
  Icon,
  IconButton,
  Tab,
  TabList,
  Tabs,
  Text,
} from "@bitrise/bitkit";

import { TabPanel, TabPanels } from "@chakra-ui/react";
import { Step } from "../models";
import StepItemBadge from "./StepItem/StepItemBadge";
import StepConfiguration from "./StepConfiguration";
import StepProperties from "./StepProperties";
import StepOutputVariables from "./StepOutputVariables";

type Props = {
  step: Step;
  highlightVersionUpdate?: boolean;
  onClone: VoidFunction;
  onRemove: VoidFunction;
};

const StepConfig = ({
  step,
  highlightVersionUpdate,
  onClone,
  onRemove,
}: Props): JSX.Element => {
  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box as="header" display="flex" px="24" pt="24" gap="16">
        <Avatar name="ci" size="48" src={step.iconURL()} />

        <Box flex="1" minW={0}>
          <Box display="flex" gap="4" alignItems="center">
            <Text size="4" fontWeight="bold" hasEllipsis>
              {step.displayName()}
            </Text>
            <StepItemBadge step={step} />
          </Box>

          <Box display="flex" gap="4" alignItems="center">
            <Text size="2" color="text.secondary">
              {step.version || step.defaultStepConfig.version}
            </Text>
            {highlightVersionUpdate && (
              <Icon
                size="16"
                name="WarningColored"
                aria-label="New version available"
              />
            )}
          </Box>
        </Box>

        {/* TODO: Implement ControlButton in Bitkit */}
        <ButtonGroup>
          <IconButton
            onClick={onClone}
            size="small"
            color="gray"
            variant="tertiary"
            iconName="Duplicate"
            aria-label="Clone this step"
          />
          <IconButton
            onClick={onRemove}
            size="small"
            color="red"
            variant="tertiary"
            iconName="MinusRemove"
            aria-label="Remove this step"
          />
        </ButtonGroup>
      </Box>

      <Tabs>
        <TabList>
          <Tab id="configuration">Configuration</Tab>
          <Tab id="properties">Properties</Tab>
          <Tab id="output-variables">Output variables</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="configuration">
            <StepConfiguration step={step} />
          </TabPanel>
          <TabPanel id="properties">
            <StepProperties step={step} />
          </TabPanel>
          <TabPanel id="output-variables">
            <StepOutputVariables step={step} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default StepConfig;

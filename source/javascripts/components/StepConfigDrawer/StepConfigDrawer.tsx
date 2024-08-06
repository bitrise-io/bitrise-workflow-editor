import { useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import {
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  Box,
  Avatar,
  Text,
  ButtonGroup,
  IconButton,
  Button,
  TabPanels,
  TabPanel,
} from '@bitrise/bitkit';
import { Maintainer } from '@/models/Algolia';
import { isUpgradeableStep } from '@/models/Step';
import StepBadge from '../StepBadge/StepBadge';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import OutputVariablesTab from './tabs/OutputVariablesTab';
import StepConfigDrawerProvider, { useStepDrawerContext } from './StepConfigDrawer.context';

type Props = UseDisclosureProps & {
  stepIndex: number;
  workflowId: string;
};

const StepConfigDrawerContent = (props: UseDisclosureProps) => {
  const { isOpen, onClose } = useDisclosure(props);
  const [selectedTab, setSelectedTab] = useState<string | undefined>('configuration');
  const { step, icon, title, resolvedVersion, maintainer, availableVersions } = useStepDrawerContext();

  const stepHasOutputVariables = (step?.outputs?.length ?? 0) > 0;

  return (
    <Tabs tabId={selectedTab} onChange={(_, tabId) => setSelectedTab(tabId)}>
      <Drawer
        isFullHeight
        isOpen={isOpen}
        onClose={onClose}
        autoFocus={false}
        onCloseComplete={() => setSelectedTab('configuration')}
      >
        <DrawerOverlay
          top={0}
          bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
        />
        <DrawerContent
          top={0}
          gap="0"
          padding={0}
          display="flex"
          flexDir="column"
          margin={[0, 32]}
          overflow="hidden"
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
            <Box display="flex" px="24" pt="24" gap="16">
              <Avatar
                size="48"
                src={icon}
                name={title || ''}
                variant="step"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="border/minimal"
              />

              <Box flex="1" minW={0}>
                <Box display="flex" gap="4" alignItems="center">
                  <Text as="h3" textStyle="heading/h3" hasEllipsis>
                    {title}
                  </Text>
                  <StepBadge
                    isOfficial={maintainer === Maintainer.Bitrise}
                    isVerified={maintainer === Maintainer.Verified}
                    isCommunity={maintainer === Maintainer.Community}
                  />
                </Box>

                <Box h="20px" display="flex" gap="8" alignItems="center">
                  <Text textStyle="body/md/regular" color="text/secondary">
                    {resolvedVersion}
                  </Text>
                </Box>
              </Box>

              <ButtonGroup>
                {isUpgradeableStep(resolvedVersion, availableVersions) && (
                  <IconButton
                    size="sm"
                    iconName="ArrowUp"
                    variant="secondary"
                    aria-label="Update to latest step version"
                  />
                )}
                <IconButton size="sm" variant="secondary" iconName="Duplicate" aria-label="Clone this step" />
                <IconButton
                  size="sm"
                  variant="secondary"
                  iconName="MinusRemove"
                  aria-label="Remove this step"
                  isDanger
                />
              </ButtonGroup>
            </Box>
            <Box position="relative" mt="8">
              <TabList paddingX="8">
                <Tab id="configuration">Configuration</Tab>
                <Tab id="properties">Properties</Tab>
                {stepHasOutputVariables && <Tab id="output-variables">Output variables</Tab>}
              </TabList>
            </Box>
          </DrawerHeader>
          <DrawerBody p="16" flex="1" overflowY="auto">
            <TabPanels>
              <TabPanel id="configuration">
                <ConfigurationTab />
              </TabPanel>
              <TabPanel id="properties">
                <PropertiesTab />
              </TabPanel>
              {stepHasOutputVariables && (
                <TabPanel id="output-variables">
                  <OutputVariablesTab />
                </TabPanel>
              )}
            </TabPanels>
          </DrawerBody>
          <DrawerFooter p="32" boxShadow="large">
            <ButtonGroup spacing={16}>
              <Button>Done</Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </ButtonGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Tabs>
  );
};

const StepConfigDrawer = ({ workflowId, stepIndex, ...disclosureProps }: Props) => {
  return (
    <StepConfigDrawerProvider workflowId={workflowId} stepIndex={stepIndex}>
      <StepConfigDrawerContent {...disclosureProps} />
    </StepConfigDrawerProvider>
  );
};

export default StepConfigDrawer;

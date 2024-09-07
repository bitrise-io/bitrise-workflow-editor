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
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Icon,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import StepBadge from '@/components/StepBadge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import defaultIcon from '@/../images/step/icon-default.svg';
import VersionUtils from '@/core/utils/VersionUtils';
import { FormValues, StepConfigTab } from './StepConfigDrawer.types';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import OutputVariablesTab from './tabs/OutputVariablesTab';
import StepConfigDrawerProvider, { useStepDrawerContext } from './StepConfigDrawer.context';

const StepConfigDrawerContent = (props: UseDisclosureProps) => {
  const { isOpen, onClose } = useDisclosure(props);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(StepConfigTab.CONFIGURATION);

  const { workflowId, stepIndex, data: step } = useStepDrawerContext();
  const { mergedValues, resolvedInfo = {} } = step ?? {};
  const stepHasOutputVariables = Boolean(mergedValues?.outputs?.length ?? 0);

  const form = useFormContext<FormValues>();
  const hasChanges = form.formState.isDirty;

  const { changeStepVersion, updateStep, cloneStep, deleteStep } = useBitriseYmlStore((s) => ({
    changeStepVersion: s.changeStepVersion,
    updateStep: s.updateStep,
    cloneStep: s.cloneStep,
    deleteStep: s.deleteStep,
  }));

  const handleUpdateStep = () => {
    changeStepVersion(workflowId, stepIndex, VersionUtils.normalizeVersion(step?.resolvedInfo?.latestVersion ?? ''));
  };

  const handleCloneStep = () => {
    cloneStep(workflowId, stepIndex);
    onClose();
  };

  const handleDelete = () => {
    deleteStep(workflowId, stepIndex);
    onClose();
  };

  const handleSave = form.handleSubmit(({ properties: { name, version } }) => {
    updateStep(workflowId, stepIndex, { title: name });
    changeStepVersion(workflowId, stepIndex, version);
    onClose();
  });

  const handleCloseComplete = () => {
    setSelectedTab(StepConfigTab.CONFIGURATION);
    form.reset();
  };

  return (
    <Tabs tabId={selectedTab} onChange={(_, tabId) => setSelectedTab(tabId)}>
      <Drawer
        isFullHeight
        isOpen={isOpen}
        onClose={onClose}
        autoFocus={false}
        closeOnEsc={!hasChanges}
        closeOnOverlayClick={!hasChanges}
        onCloseComplete={handleCloseComplete}
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
                src={resolvedInfo.icon || defaultIcon}
                name={resolvedInfo.title || 'Step'}
                variant="step"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="border/minimal"
              />

              <Box flex="1" minW={0}>
                <Box display="flex" gap="4" alignItems="center">
                  <Text as="h3" textStyle="heading/h3" hasEllipsis>
                    {resolvedInfo.title}
                  </Text>
                  <StepBadge
                    isOfficial={resolvedInfo.isOfficial}
                    isVerified={resolvedInfo.isVerified}
                    isCommunity={resolvedInfo.isCommunity}
                  />
                </Box>

                <Box display="flex" textStyle="body/md/regular" color="text/secondary" alignItems="center">
                  <Text>{resolvedInfo.resolvedVersion || 'Always latest'}</Text>
                  {resolvedInfo.isUpgradable && (
                    <>
                      <Icon size="16" marginInlineStart="8" name="StepUpgrade" />
                      <Text textStyle="body/sm/regular" cursor="pointer" onClick={handleUpdateStep}>
                        Newer version available
                        {resolvedInfo.latestVersion ? `: ${resolvedInfo.latestVersion}` : ''}
                      </Text>
                    </>
                  )}
                </Box>
              </Box>

              <ButtonGroup>
                {resolvedInfo.isUpgradable && (
                  <IconButton
                    size="sm"
                    iconName="ArrowUp"
                    variant="secondary"
                    aria-label="Update to latest step version"
                    onClick={handleUpdateStep}
                  />
                )}
                <IconButton
                  size="sm"
                  variant="secondary"
                  iconName="Duplicate"
                  aria-label="Clone this step"
                  onClick={handleCloneStep}
                />
                <IconButton
                  size="sm"
                  variant="secondary"
                  iconName="MinusRemove"
                  aria-label="Remove this step"
                  isDanger
                  onClick={handleDelete}
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
              <Button isDisabled={!hasChanges} onClick={handleSave}>
                Done
              </Button>
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

type Props = UseDisclosureProps & {
  workflowId: string;
  stepIndex: number;
};

const StepConfigDrawer = ({ workflowId, stepIndex, ...disclosureProps }: Props) => {
  return (
    <StepConfigDrawerProvider workflowId={workflowId} stepIndex={stepIndex}>
      <StepConfigDrawerContent {...disclosureProps} />
    </StepConfigDrawerProvider>
  );
};

export default StepConfigDrawer;

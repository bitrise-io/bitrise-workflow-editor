import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import semver from 'semver';
import {
  Avatar,
  Box,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import StepBadge from '@/components/StepBadge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import defaultIcon from '@/../images/step/icon-default.svg';
import VersionUtils from '@/core/utils/VersionUtils';
import { FormValues } from './StepConfigDrawer.types';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import OutputVariablesTab from './tabs/OutputVariablesTab';
import StepConfigDrawerProvider, { useStepDrawerContext } from './StepConfigDrawer.context';

type Props = UseDisclosureProps & {
  workflowId: string;
  stepIndex: number;
  onCloseComplete?: () => void;
};

const StepConfigDrawerContent = ({ onCloseComplete, ...props }: Omit<Props, 'workflowId' | 'stepIndex'>) => {
  const toast = useToast();
  const { isOpen, onClose } = useDisclosure(props);

  const form = useFormContext<FormValues>();
  const { workflowId, stepIndex, data } = useStepDrawerContext();
  const { mergedValues, defaultValues, resolvedInfo } = data ?? {};
  const stepHasOutputVariables = Boolean(mergedValues?.outputs?.length ?? 0);

  const [formTitleValue, formVersionValue] = form.watch(['properties.name', 'properties.version']);
  const isUpgradable = VersionUtils.hasVersionUpgrade(formVersionValue, resolvedInfo?.versions);
  const currentResolvedVersion = VersionUtils.resolveVersion(formVersionValue, resolvedInfo?.versions);

  const { changeStepVersion, updateStep, updateStepInputs } = useBitriseYmlStore((s) => ({
    changeStepVersion: s.changeStepVersion,
    updateStep: s.updateStep,
    updateStepInputs: s.updateStepInputs,
  }));

  const handleUpdateStep = () => {
    const updatedVersion = VersionUtils.normalizeVersion(semver.major(resolvedInfo?.latestVersion ?? '').toString());
    form.setValue('properties.version', updatedVersion, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const saveAndClose = form.handleSubmit(
    ({ properties: { name, version }, configuration: { is_always_run, is_skippable, run_if }, inputs }) => {
      updateStep(workflowId, stepIndex, { title: name, is_always_run, is_skippable, run_if }, defaultValues || {});

      const newInputs = Object.entries(inputs || {}).map(([key, value]) => ({
        [`${key}`]: value,
      }));
      updateStepInputs(workflowId, stepIndex, newInputs, defaultValues?.inputs || []);
      changeStepVersion(workflowId, stepIndex, version);
      onClose();
    },
  );

  const handleClose = () => {
    form.trigger().then((isValid) => {
      if (!isValid) {
        toast({
          status: 'error',
          title: 'Invalid Step configuration',
          description: 'Please check the configuration and try again.',
          isClosable: true,
        });
        return;
      }

      saveAndClose();
    });
  };

  return (
    <Tabs>
      <Drawer isFullHeight isOpen={isOpen} autoFocus={false} onClose={handleClose} onCloseComplete={onCloseComplete}>
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
          margin={[0, 24]}
          overflow="hidden"
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerCloseButton size="md">
            <Icon name="Cross" />
          </DrawerCloseButton>

          <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
            <Box display="flex" px="24" pt="24" gap="16">
              <Avatar
                size="48"
                src={data?.icon || defaultIcon}
                name={formTitleValue}
                variant="step"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="border/minimal"
              />

              <Box flex="1" minW={0}>
                <Box display="flex" gap="4" alignItems="center">
                  <Text as="h3" textStyle="heading/h3" hasEllipsis>
                    {formTitleValue}
                  </Text>
                  <StepBadge
                    isOfficial={resolvedInfo?.isOfficial}
                    isVerified={resolvedInfo?.isVerified}
                    isCommunity={resolvedInfo?.isCommunity}
                  />
                </Box>

                <Box display="flex" textStyle="body/md/regular" color="text/secondary" alignItems="center">
                  <Text>{currentResolvedVersion || 'Always latest'}</Text>
                  {isUpgradable && (
                    <>
                      <Icon size="16" marginInlineStart="8" name="StepUpgrade" />
                      <Text textStyle="body/sm/regular" cursor="pointer" onClick={handleUpdateStep}>
                        Newer version available
                        {resolvedInfo?.latestVersion ? `: ${resolvedInfo?.latestVersion}` : ''}
                      </Text>
                    </>
                  )}
                </Box>
              </Box>
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
        </DrawerContent>
      </Drawer>
    </Tabs>
  );
};

const StepConfigDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  return (
    <StepConfigDrawerProvider workflowId={workflowId} stepIndex={stepIndex}>
      <StepConfigDrawerContent {...props} />
    </StepConfigDrawerProvider>
  );
};

export default StepConfigDrawer;

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
import { Avatar, Box, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure } from '@bitrise/bitkit';
import StepBadge from '@/components/StepBadge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import defaultIcon from '@/../images/step/icon-default.svg';
import VersionUtils from '@/core/utils/VersionUtils';
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
  const { isOpen, onClose } = useDisclosure(props);
  const { workflowId, stepIndex, data } = useStepDrawerContext();
  const changeStepVersion = useBitriseYmlStore((s) => s.changeStepVersion);

  const latestVersion = data?.resolvedInfo?.latestVersion || '0.0.0';
  const latestMajorVersion = VersionUtils.normalizeVersion(semver.major(latestVersion).toString());
  const stepHasOutputVariables = Boolean(data?.mergedValues?.outputs?.length ?? 0);

  const isUpgradable = VersionUtils.hasVersionUpgrade(
    data?.resolvedInfo?.normalizedVersion,
    data?.resolvedInfo?.versions,
  );

  return (
    <Tabs>
      <Drawer isFullHeight isOpen={isOpen} autoFocus={false} onClose={onClose} onCloseComplete={onCloseComplete}>
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
                name={data?.mergedValues?.title || ''}
                variant="step"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="border/minimal"
                backgroundColor="background/primary"
              />

              <Box flex="1" minW={0}>
                <Box display="flex" gap="4" alignItems="center">
                  <Text as="h3" textStyle="heading/h3" hasEllipsis>
                    {data?.mergedValues?.title || 'Loading...'}
                  </Text>
                  <StepBadge
                    isOfficial={data?.resolvedInfo?.isOfficial}
                    isVerified={data?.resolvedInfo?.isVerified}
                    isCommunity={data?.resolvedInfo?.isCommunity}
                  />
                </Box>

                <Box display="flex" textStyle="body/md/regular" color="text/secondary" alignItems="center">
                  <Text display="flex">{data?.resolvedInfo?.resolvedVersion || 'Always latest'}</Text>
                  {isUpgradable && (
                    <>
                      <Icon size="16" marginInline="4" name="WarningYellow" />
                      <Text
                        cursor="pointer"
                        textStyle="body/sm/regular"
                        onClick={() => changeStepVersion(workflowId, stepIndex, latestMajorVersion)}
                      >
                        Latest version: {latestVersion}
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

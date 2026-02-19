import { Avatar, Box, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import semver from 'semver';

import defaultIcon from '@/../images/step/icon-default.svg';
import StepBadge from '@/components/StepBadge';
import StepContainersTab from '@/components/unified-editor/StepConfigDrawer/tabs/StepContainersTab';
import StepService from '@/core/services/StepService';
import VersionUtils from '@/core/utils/VersionUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepConfigDrawerProvider, { useStepDrawerContext } from './StepConfigDrawer.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import OutputVariablesTab from './tabs/OutputVariablesTab';
import PropertiesTab from './tabs/PropertiesTab';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  stepBundleId?: string;
  workflowId: string;
  stepIndex: number;
  parentWorkflowId?: string;
};

const StepConfigDrawerContent = (
  props: Omit<Props, 'workflowId' | 'stepBundleId' | 'stepIndex' | 'parentWorkflowId'>,
) => {
  const { workflowId, stepBundleId, stepIndex, data } = useStepDrawerContext();

  const latestVersion = data?.resolvedInfo?.latestVersion || '0.0.0';
  const latestMajorVersion = VersionUtils.normalizeVersion(semver.major(latestVersion).toString());
  const stepHasOutputVariables = Boolean(data?.mergedValues?.outputs?.length ?? 0);

  const isUpgradable = VersionUtils.hasVersionUpgrade(
    data?.resolvedInfo?.normalizedVersion,
    data?.resolvedInfo?.versions,
  );

  const enableContainers = useFeatureFlag('enable-wfe-containers-page');

  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="16">
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
                        onClick={() => {
                          const source = stepBundleId ? 'step_bundles' : 'workflows';
                          const sourceId = stepBundleId || workflowId;
                          StepService.changeStepVersion(source, sourceId, stepIndex, latestMajorVersion);
                        }}
                      >
                        Latest version: {latestVersion}
                      </Text>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
            <Box position="relative" mt="8" mx="-24">
              <TabList paddingX="8">
                <Tab>Configuration</Tab>
                <Tab>Properties</Tab>
                {stepHasOutputVariables && <Tab>Output variables</Tab>}
                {enableContainers && <Tab>Containers</Tab>}
              </TabList>
            </Box>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>
                <ConfigurationTab />
              </TabPanel>
              <TabPanel>
                <PropertiesTab />
              </TabPanel>
              {stepHasOutputVariables && (
                <TabPanel>
                  <OutputVariablesTab />
                </TabPanel>
              )}
              {enableContainers && (
                <TabPanel>
                  <StepContainersTab />
                </TabPanel>
              )}
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

const StepConfigDrawer = ({ workflowId, stepIndex, stepBundleId, parentWorkflowId, ...props }: Props) => {
  return (
    <StepConfigDrawerProvider
      workflowId={workflowId}
      stepBundleId={stepBundleId}
      stepIndex={stepIndex}
      parentWorkflowId={parentWorkflowId}
    >
      <StepConfigDrawerContent {...props} />
    </StepConfigDrawerProvider>
  );
};

export default StepConfigDrawer;

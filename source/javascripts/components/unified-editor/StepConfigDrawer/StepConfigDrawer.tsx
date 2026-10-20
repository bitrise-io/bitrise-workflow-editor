import { Icon, Tab, TabList, TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { BitkitAvatar, BitkitHeading } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import semver from 'semver';

import defaultIcon from '@/../images/step/icon-default.svg';
import StepBadge from '@/components/StepBadge';
import StepContainersTab from '@/components/unified-editor/StepConfigDrawer/tabs/StepContainersTab';
import StepService from '@/core/services/StepService';
import VersionUtils from '@/core/utils/VersionUtils';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import { useStepDrawerContext } from './StepConfigDrawer.context';
import StepConfigDrawerProvider from './StepConfigDrawerProvider';
import ConfigurationTab from './tabs/ConfigurationTab';
import OutputVariablesTab from './tabs/OutputVariablesTab';
import PropertiesTab from './tabs/PropertiesTab';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  stepBundleId?: string;
  workflowId: string;
  stepIndex: number;
};

const StepConfigDrawerContent = (props: Omit<Props, 'workflowId' | 'stepBundleId' | 'stepIndex'>) => {
  const { workflowId, stepBundleId, stepIndex, data } = useStepDrawerContext();

  const latestVersion = data?.resolvedInfo?.latestVersion || '0.0.0';
  const latestMajorVersion = VersionUtils.normalizeVersion(semver.major(latestVersion).toString());
  const stepHasOutputVariables = Boolean(data?.mergedValues?.outputs?.length ?? 0);

  const isUpgradable = VersionUtils.hasVersionUpgrade(
    data?.resolvedInfo?.normalizedVersion,
    data?.resolvedInfo?.versions,
  );

  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="16">
              <BitkitAvatar
                variant="image"
                size="48"
                src={data?.icon || defaultIcon}
                name={data?.mergedValues?.title || ''}
              />

              <Box flex="1" minWidth="0">
                <Box display="flex" gap="4" alignItems="center">
                  <BitkitHeading as="h3" truncate maxWidth="full">
                    {data?.mergedValues?.title || 'Loading...'}
                  </BitkitHeading>
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
            <Box position="relative" marginBlockStart="8" marginInline="-24">
              <TabList paddingX="8" data-clarity-unmask="true">
                <Tab>Configuration</Tab>
                <Tab>Properties</Tab>
                {stepHasOutputVariables && <Tab>Output variables</Tab>}
                <Tab>Containers</Tab>
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
              <TabPanel>
                <StepContainersTab />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

const StepConfigDrawer = ({ workflowId, stepIndex, stepBundleId, ...props }: Props) => {
  return (
    <StepConfigDrawerProvider workflowId={workflowId} stepBundleId={stepBundleId} stepIndex={stepIndex}>
      <StepConfigDrawerContent {...props} />
    </StepConfigDrawerProvider>
  );
};

export default StepConfigDrawer;

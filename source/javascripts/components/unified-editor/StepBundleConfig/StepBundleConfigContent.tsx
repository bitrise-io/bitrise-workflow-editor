import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import useFeatureFlag from '@/hooks/useFeatureFlag';

import ContainersTab from '../ContainersTab/ContainersTab';
import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onChangeId?: (name: string) => void;
  variant: 'panel' | 'drawer';
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onChangeId, variant, ...rest }: ConfigContentProps) => {
  const enableContainers = useFeatureFlag('enable-wfe-containers-page');

  return (
    <TabPanels {...rest}>
      <TabPanel height="100%">
        <StepBundleConfigurationTab />
      </TabPanel>
      <TabPanel display="flex" flexDirection="column" gap="24">
        <StepBundlePropertiesTab onDelete={onDelete} onChangeId={onChangeId} variant={variant} />
      </TabPanel>
      {enableContainers && (
        <TabPanel height="100%">
          <ContainersTab source="step_bundles" sourceId={''} stepIndex={0} variant={variant} />
        </TabPanel>
      )}
    </TabPanels>
  );
};

export default StepBundleConfigContent;

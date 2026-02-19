import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import StepBundleContainersTab from '@/components/unified-editor/StepBundleConfig/tabs/StepBundleContainersTab';
import useFeatureFlag from '@/hooks/useFeatureFlag';

import StepBundleConfigurationTab from './tabs/StepBundleConfigurationTab';
import StepBundlePropertiesTab from './tabs/StepBundlePropertiesTab';

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
          <StepBundleContainersTab />
        </TabPanel>
      )}
    </TabPanels>
  );
};

export default StepBundleConfigContent;

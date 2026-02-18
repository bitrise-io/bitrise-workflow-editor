import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import useFeatureFlag from '@/hooks/useFeatureFlag';

import ContainersTab from '../StepConfigDrawer/tabs/ContainersTab';
import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onChangeId?: (name: string) => void;
  variant: 'panel' | 'drawer';
  showContainers: boolean;
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onChangeId, showContainers, variant, ...rest }: ConfigContentProps) => {
  const enableContainers = useFeatureFlag('enable-wfe-containers-page');

  return (
    <TabPanels {...rest}>
      <TabPanel height="100%">
        <StepBundleConfigurationTab />
      </TabPanel>
      <TabPanel display="flex" flexDirection="column" gap="24">
        <StepBundlePropertiesTab onDelete={onDelete} onChangeId={onChangeId} variant={variant} />
      </TabPanel>
      {enableContainers && showContainers && (
        <TabPanel height="100%">
          <ContainersTab />
        </TabPanel>
      )}
    </TabPanels>
  );
};

export default StepBundleConfigContent;

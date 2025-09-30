import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onRename?: (name: string) => void;
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onRename, ...rest }: ConfigContentProps) => {
  return (
    <TabPanels {...rest}>
      <TabPanel height="100%">
        <StepBundleConfigurationTab />
      </TabPanel>
      <TabPanel>
        <StepBundlePropertiesTab onDelete={onDelete} onRename={onRename} />
      </TabPanel>
    </TabPanels>
  );
};

export default StepBundleConfigContent;

import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onChangeID?: (name: string) => void;
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onChangeID, ...rest }: ConfigContentProps) => {
  return (
    <TabPanels {...rest}>
      <TabPanel height="100%">
        <StepBundleConfigurationTab />
      </TabPanel>
      <TabPanel display="flex" flexDirection="column" gap="24">
        <StepBundlePropertiesTab onDelete={onDelete} onChangeID={onChangeID} />
      </TabPanel>
    </TabPanels>
  );
};

export default StepBundleConfigContent;

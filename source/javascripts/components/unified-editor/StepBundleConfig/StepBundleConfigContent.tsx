import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';

import { useStepDrawerContext } from '../StepConfigDrawer/StepConfigDrawer.context';
import ContainersTab from '../StepConfigDrawer/tabs/ContainersTab';
import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onChangeId?: (name: string) => void;
  variant: 'panel' | 'drawer';
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onChangeId, variant, ...rest }: ConfigContentProps) => {
  const { workflowId } = useStepDrawerContext();

  return (
    <TabPanels {...rest}>
      <TabPanel height="100%">
        <StepBundleConfigurationTab />
      </TabPanel>
      <TabPanel display="flex" flexDirection="column" gap="24">
        <StepBundlePropertiesTab onDelete={onDelete} onChangeId={onChangeId} variant={variant} />
      </TabPanel>
      {!!workflowId && (
        <TabPanel height="100%">
          <ContainersTab />
        </TabPanel>
      )}
    </TabPanels>
  );
};

export default StepBundleConfigContent;

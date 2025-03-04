import { TabPanel, TabPanelProps, TabPanels } from '@bitrise/bitkit';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import StepBundleConfigurationTab from './StepBundleConfigurationTab';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

type ConfigContentProps = {
  onDelete?: () => void;
  onRename?: (name: string) => void;
} & TabPanelProps;

const StepBundleConfigContent = ({ onDelete, onRename, ...rest }: ConfigContentProps) => {
  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui');

  return (
    <TabPanels {...rest}>
      {enableStepBundles && (
        <TabPanel height="100%">
          <StepBundleConfigurationTab />
        </TabPanel>
      )}
      <TabPanel>
        <StepBundlePropertiesTab onDelete={onDelete} onRename={onRename} />
      </TabPanel>
    </TabPanels>
  );
};

export default StepBundleConfigContent;

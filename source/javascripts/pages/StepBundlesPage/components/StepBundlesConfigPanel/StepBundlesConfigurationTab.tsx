import { Text } from '@bitrise/bitkit';

type ConfigurationTabProps = {
  parentStepBundleId: string;
};

const StepBundlesConfigurationTab = ({ parentStepBundleId }: ConfigurationTabProps) => {
  return <Text>{parentStepBundleId}</Text>;
};

export default StepBundlesConfigurationTab;

import { BitkitTabs } from '@bitrise/bitkit-v2';
import type { TabsContentGroupProps } from '@chakra-ui/react/tabs';

import StepBundleContainersTab from '@/components/unified-editor/StepBundleConfig/tabs/StepBundleContainersTab';

import StepBundleConfigurationTab from './tabs/StepBundleConfigurationTab';
import StepBundlePropertiesTab from './tabs/StepBundlePropertiesTab';
import { StepBundleConfigTab } from './types/StepBundle.types';

type ConfigContentProps = {
  onDelete?: () => void;
  onChangeId?: (name: string) => void;
  variant: 'panel' | 'drawer';
} & TabsContentGroupProps;

const StepBundleConfigContent = ({ onDelete, onChangeId, variant, ...rest }: ConfigContentProps) => {
  return (
    <BitkitTabs.ContentGroup {...rest}>
      <BitkitTabs.Content value={StepBundleConfigTab.CONFIGURATION} height="100%">
        <StepBundleConfigurationTab />
      </BitkitTabs.Content>
      <BitkitTabs.Content value={StepBundleConfigTab.PROPERTIES} display="flex" flexDirection="column" gap="24">
        <StepBundlePropertiesTab onDelete={onDelete} onChangeId={onChangeId} variant={variant} />
      </BitkitTabs.Content>
      <BitkitTabs.Content value={StepBundleConfigTab.CONTAINERS} height="100%">
        <StepBundleContainersTab />
      </BitkitTabs.Content>
    </BitkitTabs.ContentGroup>
  );
};

export default StepBundleConfigContent;

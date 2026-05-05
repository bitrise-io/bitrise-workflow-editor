import DefaultStackAndMachine from '@/components/StacksAndMachine/DefaultStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import ToolVersions from '@/components/ToolVersions/ToolVersions';
import useFeatureFlag from '@/hooks/useFeatureFlag';

const DefaultTab = () => {
  const isToolVersionsEnabled = useFeatureFlag('enable-wfe-tool-versions');

  return (
    <TabContainer>
      <DefaultStackAndMachine />
      {isToolVersionsEnabled && <ToolVersions />}
    </TabContainer>
  );
};

export default DefaultTab;

import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs, useTabs } from '@bitrise/bitkit';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { StepBundleConfigTab } from '@/components/unified-editor/StepBundlesConfig/StepBundleConfigTab';
import StepBundleConfigurationTab from '@/components/unified-editor/StepBundlesConfig/StepBundleConfigurationTab';
import useSearchParams from '@/hooks/useSearchParams';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = {
  id: string;
};

const TAB_IDS = [StepBundleConfigTab.CONFIGURATION, StepBundleConfigTab.PROPERTIES];

const StepBundlesConfigPanelContent = () => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTabIndex, tabIndex } = useTabs<StepBundleConfigTab>({ tabIds: TAB_IDS });

  const onTabChange = (index: number) => {
    setSearchParams({
      ...searchParams,
      tab: TAB_IDS[index],
    });
  };

  useEffect(() => {
    if (searchParams.tab) {
      setTabIndex(TAB_IDS.indexOf(searchParams.tab as StepBundleConfigTab));
    }
  }, [searchParams, setTabIndex]);

  return (
    <Tabs
      display="flex"
      flexDir="column"
      borderLeft="1px solid"
      borderColor="border/regular"
      index={tabIndex}
      onChange={onTabChange}
    >
      <StepBundlesConfigHeader />
      <TabPanels flex="1" minH="0">
        <TabPanel p="24" overflowY="auto" h="100%">
          <StepBundleConfigurationTab />
        </TabPanel>
        <TabPanel p="24" overflowY="auto" h="100%">
          <StepBundlePropertiesTab onDelete={() => closeDialog()} onRename={setSelectedStepBundle} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const StepBundlesConfigPanel = ({ id }: Props) => {
  return (
    <StepBundlesConfigProvider id={id} stepIndex={-1}>
      <StepBundlesConfigPanelContent />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;

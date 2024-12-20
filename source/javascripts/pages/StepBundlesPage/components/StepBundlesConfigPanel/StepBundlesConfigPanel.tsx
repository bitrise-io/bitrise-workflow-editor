import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs, useTabs } from '@bitrise/bitkit';
import useSearchParams from '@/hooks/useSearchParams';
import { StepBundlesConfigTab } from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfig.types';
import useSelectedStepBundle from '@/pages/StepBundlesPage/hooks/useSelectedStepBundle';
import PropertiesTab from '@/components/unified-editor/WorkflowConfig/tabs/PropertiesTab';
import ConfigurationTab from '@/components/unified-editor/WorkflowConfig/tabs/ConfigurationTab';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import WorkflowConfigHeader from '@/components/unified-editor/WorkflowConfig/components/WorkflowConfigHeader';
import StepBundlesConfigProvider from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfig.context';

const TAB_IDS = [StepBundlesConfigTab.CONFIGURATION, StepBundlesConfigTab.PROPERTIES];

const StepBundlesConfigPanelContent = () => {
  const [, setSelectedStepBundle] = useSelectedStepBundle();
  const stepBundles = useStepBundles();
  const { setTabIndex, tabIndex } = useTabs<StepBundlesConfigTab>({
    tabIds: TAB_IDS,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.tab) {
      setTabIndex(TAB_IDS.indexOf(searchParams.tab as StepBundlesConfigTab));
    }
  }, [searchParams, setTabIndex]);

  const onTabChange = (index: number) => {
    setSearchParams({
      ...searchParams,
      tab: TAB_IDS[index],
    });
  };

  const closeDialog = useStepBundlesPageStore((s) => s.closeDialog);
  const onDelete = (deletedId: string) => {
    setSelectedStepBundle(Object.keys(stepBundles).find((stepBundleId) => stepBundleId !== deletedId));
    closeDialog();
  };

  return (
    <Tabs
      display="flex"
      flexDir="column"
      borderLeft="1px solid"
      borderColor="border/regular"
      index={tabIndex}
      onChange={onTabChange}
    >
      <WorkflowConfigHeader variant="panel" context="workflow" />
      <TabPanels flex="1" minH="0">
        <TabPanel p="24" overflowY="auto" h="100%">
          <ConfigurationTab context="workflow" />
        </TabPanel>
        <TabPanel p="24" overflowY="auto" h="100%">
          <PropertiesTab variant="panel" onRename={setSelectedStepBundle} onDelete={onDelete} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type Props = {
  stepBundleId: string;
};

const StepBundlesConfigPanel = ({ stepBundleId }: Props) => {
  return (
    <StepBundlesConfigProvider stepBundleId={stepBundleId}>
      <StepBundlesConfigPanelContent />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;

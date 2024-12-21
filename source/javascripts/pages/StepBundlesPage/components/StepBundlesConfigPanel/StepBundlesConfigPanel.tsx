import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs, useTabs } from '@bitrise/bitkit';
import useSearchParams from '@/hooks/useSearchParams';
import { StepBundlesConfigTab } from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfig.types';
import useSelectedStepBundle from '@/pages/StepBundlesPage/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import StepBundlesConfigProvider from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfig.context';
import StepBundlesPropertiesTab from '@/components/unified-editor/StepBundleDrawer/StepBundlePropertiesTab';
import StepBundlesConfigurationTab from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfigurationTab';
import StepBundlesConfigHeader from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfigHeader';

const TAB_IDS = [StepBundlesConfigTab.CONFIGURATION, StepBundlesConfigTab.PROPERTIES];

type ConfigPanelContentProps = {
  stepBundleId: string;
};

const StepBundlesConfigPanelContent = ({ stepBundleId }: ConfigPanelContentProps) => {
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
    setSelectedStepBundle(Object.keys(stepBundles).find((bundleId) => bundleId !== deletedId));
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
      <StepBundlesConfigHeader parentStepBundleId={stepBundleId} />
      <TabPanels flex="1" minH="0">
        <TabPanel p="24" overflowY="auto" h="100%">
          <StepBundlesConfigurationTab parentStepBundleId={stepBundleId} />
        </TabPanel>
        <TabPanel p="24" overflowY="auto" h="100%">
          <StepBundlesPropertiesTab stepBundleId={stepBundleId} />
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
      <StepBundlesConfigPanelContent stepBundleId={stepBundleId} />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;

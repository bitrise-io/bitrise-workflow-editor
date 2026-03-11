import { Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
import { useEffect } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { ContainerType } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useContainers from '@/hooks/useContainers';
import useSearchParams from '@/hooks/useSearchParams';

import ExecutionContainersTab from './components/ExecutionContainersTab';
import ServiceContainersTab from './components/ServiceContainersTab';
import { getContainersBadge } from './utils/ContainersPage.utils';

const TAB_IDS = [ContainerType.Execution, ContainerType.Service];

const ContainersPage = () => {
  const { [ContainerType.Execution]: executionContainers, [ContainerType.Service]: serviceContainers } =
    useContainers();

  const [searchParams, setSearchParams] = useSearchParams();
  const { setTabIndex, tabIndex } = useTabs({ tabIds: TAB_IDS });

  const trackSubtabDisplayed = (tab: ContainerType) => {
    segmentTrack('Container Subtab Displayed', {
      app_slug: PageProps.appSlug(),
      workspace_slug: GlobalProps.workspaceSlug(),
      tab_name: tab === ContainerType.Execution ? 'execution_containers' : 'service_containers',
    });
  };

  const onTabChange = (index: number) => {
    setSearchParams({
      ...searchParams,
      tab: TAB_IDS[index],
    });
  };

  useEffect(() => {
    if (searchParams.tab && TAB_IDS.includes(searchParams.tab as ContainerType)) {
      const index = TAB_IDS.indexOf(searchParams.tab as ContainerType);
      setTabIndex(index);
      trackSubtabDisplayed(TAB_IDS[index]);
    } else {
      setSearchParams({ ...searchParams, tab: TAB_IDS[0] });
    }
  }, [searchParams, setSearchParams, setTabIndex]);

  return (
    <>
      <Text as="h2" textStyle="heading/h2" pt="32" px="32" mb="4">
        Containers
      </Text>
      <Text textStyle="body/md/regular" color="text/secondary" pb="24" px="32">
        Create custom environments and services for your Workflows.{' '}
        <Link colorScheme="purple" isExternal href="https://docs.bitrise.io">
          Learn more about containers
        </Link>
      </Text>
      <Tabs index={tabIndex} onChange={onTabChange}>
        <TabList px="16">
          <Tab badge={getContainersBadge(executionContainers.length)}>Execution containers</Tab>
          <Tab badge={getContainersBadge(serviceContainers.length)}>Service containers</Tab>
        </TabList>
        <TabPanels p="32">
          <TabPanel>
            <ExecutionContainersTab />
          </TabPanel>
          <TabPanel>
            <ServiceContainersTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default ContainersPage;

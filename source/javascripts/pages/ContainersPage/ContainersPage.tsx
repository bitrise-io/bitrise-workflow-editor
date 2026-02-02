import { Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
import { useEffect } from 'react';

import { ContainerType } from '@/core/models/Container';
import useContainers from '@/hooks/useContainers';
import useSearchParams from '@/hooks/useSearchParams';

import ExecutionContainersTab from './components/ExecutionContainersTab';
import ServiceContainersTab from './components/ServiceContainersTab';
import { getContainersBadge } from './utils/ContainersPage.utils';

const TAB_IDS = [ContainerType.Execution, ContainerType.Service];

const ContainersPage = () => {
  const containerTypes = useContainers((containers) => Object.values(containers).map((c) => c?.type));
  const executionContainerCount = containerTypes.filter((t) => t === ContainerType.Execution).length;
  const serviceContainerCount = containerTypes.filter((t) => t === ContainerType.Service).length;

  const [searchParams, setSearchParams] = useSearchParams();
  const { setTabIndex, tabIndex } = useTabs({ tabIds: TAB_IDS });

  const onTabChange = (index: number) => {
    setSearchParams({
      ...searchParams,
      tab: TAB_IDS[index],
    });
  };

  useEffect(() => {
    if (searchParams.tab) {
      setTabIndex(TAB_IDS.indexOf(searchParams.tab as ContainerType));
    }
  }, [searchParams, setTabIndex]);

  return (
    <>
      <Text as="h2" textStyle="heading/h2" pt="32" px="32" mb="4">
        Containers
      </Text>
      <Text textStyle="body/md/regular" color="text/secondary" pb="24" px="32">
        Create custom environments and services for your Workflows.{' '}
        <Link colorScheme="purple" isExternal href="#">
          Learn more about containers
        </Link>
      </Text>
      <Tabs index={tabIndex} onChange={onTabChange}>
        <TabList px="16">
          <Tab badge={getContainersBadge(executionContainerCount)}>Execution containers</Tab>
          <Tab badge={getContainersBadge(serviceContainerCount)}>Service containers</Tab>
        </TabList>
        <TabPanels>
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

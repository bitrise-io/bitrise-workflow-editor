import { Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
import { useEffect } from 'react';

import useSearchParams from '@/hooks/useSearchParams';
import ExecutionContainersTab from '@/pages/ContainersPage/components/ExecutionContainersTab';
import ServiceContainersTab from '@/pages/ContainersPage/components/ServiceContainersTab';

const TAB_IDS = ['execution_containers', 'service_containers'];

const ContainersPage = () => {
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
      setTabIndex(TAB_IDS.indexOf(searchParams.tab));
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
          <Tab>Execution containers</Tab>
          <Tab>Service containers</Tab>
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

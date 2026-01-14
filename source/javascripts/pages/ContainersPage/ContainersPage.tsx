import { Box, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
import { useEffect } from 'react';

import useSearchParams from '@/hooks/useSearchParams';
import ExecutionContainersTab from '@/pages/ContainersPage/ExecutionContainersTab';

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
      <Box p="32px 32px 24px">
        <Text textStyle="heading/h2" mb="4">
          Containers
        </Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Create custom environments and services for your Workflows.{' '}
          <Link colorScheme="purple" isExternal href="#">
            Learn more about containers
          </Link>
        </Text>
      </Box>
      <Tabs index={tabIndex} onChange={onTabChange}>
        <TabList px="16">
          <Tab>Execution containers</Tab>
          <Tab>Service containers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ExecutionContainersTab />
          </TabPanel>
          <TabPanel>{/* TODO: Service containers tab */}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default ContainersPage;

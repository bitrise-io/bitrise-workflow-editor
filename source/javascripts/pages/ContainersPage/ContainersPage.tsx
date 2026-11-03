import { BitkitBadge, BitkitHeading, BitkitLink, BitkitTabs } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { useEffect } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { Container, ContainerType } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { useModuleContainers } from '@/hooks/useContainers';
import useContainerWorkflowUsage from '@/hooks/useContainerWorkflowUsage';
import useSearchParams from '@/hooks/useSearchParams';

import ExecutionContainersTab from './components/ExecutionContainersTab';
import ServiceContainersTab from './components/ServiceContainersTab';

const TAB_IDS = [ContainerType.Execution, ContainerType.Service];

const getContainersBadge = (count: number) => (
  <BitkitBadge colorVariant={count > 0 ? 'purple' : 'neutral'}>{count}</BitkitBadge>
);

const ContainersPage = () => {
  const { [ContainerType.Execution]: executionContainers, [ContainerType.Service]: serviceContainers } =
    useModuleContainers();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabId = TAB_IDS.includes(searchParams.tab as ContainerType) ? searchParams.tab : TAB_IDS[0];

  const containerUsageLookup = useContainerWorkflowUsage();
  const countInUse = (containers: Container[]) =>
    containers.filter((c) => {
      const usageCount = containerUsageLookup.get(c.id)?.length ?? 0;
      return usageCount > 0;
    }).length;

  const onTabChange = ({ value }: { value: string }) => {
    setSearchParams({
      ...searchParams,
      tab: value,
    });
  };

  useEffect(() => {
    if (searchParams.tab && TAB_IDS.includes(searchParams.tab as ContainerType)) {
      const tab = searchParams.tab as ContainerType;
      segmentTrack('Container Subtab Displayed', {
        app_slug: PageProps.appSlug(),
        workspace_slug: GlobalProps.workspaceSlug(),
        tab_name: tab === ContainerType.Execution ? 'execution_containers' : 'service_containers',
        is_default_tab: tab === ContainerType.Execution,
        number_of_containers_in_use:
          tab === ContainerType.Execution ? countInUse(executionContainers) : countInUse(serviceContainers),
        number_of_containers_not_in_use:
          tab === ContainerType.Execution
            ? executionContainers.length - countInUse(executionContainers)
            : serviceContainers.length - countInUse(serviceContainers),
      });
    } else {
      setSearchParams({ ...searchParams, tab: TAB_IDS[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      <BitkitHeading paddingBlockStart="32" paddingInline="32" marginBlockEnd="4" data-clarity-unmask="true">
        Containers
      </BitkitHeading>
      <Text
        textStyle="body/md/regular"
        color="text/secondary"
        paddingBlockEnd="24"
        paddingInline="32"
        data-clarity-unmask="true"
      >
        Create custom environments and services for your Workflows.{' '}
        <BitkitLink
          colorVariant="purple"
          isExternal
          href="https://docs.bitrise.io/en/bitrise-platform/infrastructure/docker-containers-on-bitrise/about-docker-containers-on-bitrise.html"
        >
          Learn more
        </BitkitLink>
      </Text>
      <BitkitTabs.Root value={tabId} onValueChange={onTabChange}>
        {/* The badges carry a bare count of container definitions — no ids, images or workflow
            names — so the tab strip counts as chrome rather than customer data. */}
        <BitkitTabs.List paddingInline="16" data-clarity-unmask="true">
          <BitkitTabs.Trigger value={ContainerType.Execution} badge={getContainersBadge(executionContainers.length)}>
            Execution containers
          </BitkitTabs.Trigger>
          <BitkitTabs.Trigger value={ContainerType.Service} badge={getContainersBadge(serviceContainers.length)}>
            Service containers
          </BitkitTabs.Trigger>
        </BitkitTabs.List>
        <BitkitTabs.ContentGroup padding="32">
          <BitkitTabs.Content value={ContainerType.Execution}>
            <ExecutionContainersTab />
          </BitkitTabs.Content>
          <BitkitTabs.Content value={ContainerType.Service}>
            <ServiceContainersTab />
          </BitkitTabs.Content>
        </BitkitTabs.ContentGroup>
      </BitkitTabs.Root>
    </>
  );
};

export default ContainersPage;

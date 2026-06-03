import { Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { Container, ContainerType } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useNavigation from '@/hooks/useNavigation';

export type ContainerReferenceSource = 'step_bundle_definition' | 'step_bundle_instance' | 'step_instance';

type ContainersMenuProps = {
  actionType: 'Add' | 'Change';
  containers: Container[];
  onSelectContainer: (containerId: string) => void;
  source: ContainerReferenceSource;
  stepBundleId?: string;
  stepId?: string;
  stepVersion?: string;
  type: ContainerType;
};

const ContainersMenu = (props: ContainersMenuProps) => {
  const { actionType, containers, onSelectContainer, source, stepBundleId, stepId, stepVersion, type } = props;
  const { replace } = useNavigation();

  const handleManageContainers = () => {
    replace('/containers', { tab: type });
    segmentTrack('Manage Containers Link Clicked', {
      app_slug: PageProps.appSlug(),
      workspace_slug: GlobalProps.workspaceSlug(),
      tab_name: type === ContainerType.Execution ? 'execution_containers' : 'service_containers',
      is_default_tab: type === ContainerType.Execution,
      source,
    });
  };

  return (
    <Menu>
      <MenuButton as={Button} variant="tertiary" leftIconName={actionType === 'Add' ? 'Plus' : 'Replace'} size="sm">
        {actionType} container
      </MenuButton>
      <MenuList>
        {containers.map((container) => (
          <MenuItem
            key={container.id}
            onClick={() => {
              onSelectContainer(container.id);
              segmentTrack('Container Assigned', {
                app_slug: PageProps.appSlug(),
                workspace_slug: GlobalProps.workspaceSlug(),
                container_type: type,
                container_unique_id: container.id,
                container_image: container.userValues.image,
                source,
                step_id: stepId,
                step_bundle_id: stepBundleId,
                step_version: stepVersion,
              });
            }}
            display="flex"
            flexDir="column"
            alignItems="flex-start"
          >
            <Text>{container.id}</Text>
            <Text color="text/helper">{container.userValues.image}</Text>
          </MenuItem>
        ))}
        {containers.length > 0 && <Divider color="border/minimal" mb="8" />}
        <MenuItem onClick={handleManageContainers}>Manage containers</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContainersMenu;

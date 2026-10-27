import { BitkitActionMenu, BitkitButton, IconPlus, IconReplace } from '@bitrise/bitkit-v2';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { Container, ContainerType } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useNavigation from '@/hooks/useNavigation';
import { useIsReadOnlyView } from '@/hooks/useTree';

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
  const isReadOnlyView = useIsReadOnlyView();
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
    <BitkitActionMenu
      trigger={
        <BitkitButton
          variant="tertiary"
          icon={actionType === 'Add' ? IconPlus : IconReplace}
          size="sm"
          state={isReadOnlyView ? 'disabled' : undefined}
        >
          {`${actionType} container`}
        </BitkitButton>
      }
    >
      {containers.map((container) => (
        <BitkitActionMenu.Item
          key={container.id}
          secondaryText={container.userValues.image}
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
        >
          {container.id}
        </BitkitActionMenu.Item>
      ))}
      {containers.length > 0 && <BitkitActionMenu.Separator />}
      <BitkitActionMenu.Item onClick={handleManageContainers}>Manage containers</BitkitActionMenu.Item>
    </BitkitActionMenu>
  );
};

export default ContainersMenu;

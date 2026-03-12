import { Box, Checkbox, ControlButton, Td, Text, Tooltip, Tr } from '@bitrise/bitkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { Container, ContainerReference } from '@/core/models/Container';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';

import { ContainerReferenceSource } from './ContainersMenu';

type ContainerCardItemProps = {
  container?: Container;
  isDisabled?: boolean;
  onRecreate: (containerId: string, recreate: boolean) => void;
  onRemove: (containerId: string) => void;
  reference: ContainerReference;
  source: ContainerReferenceSource;
  stepBundleId?: string;
  stepId?: string;
};

const ContainerCardItem = (props: ContainerCardItemProps) => {
  const { container, isDisabled, onRecreate, onRemove, reference, source, stepId, stepBundleId } = props;

  const handleRemove = () => {
    onRemove(reference.id);
    segmentTrack('Container Unassigned', {
      app_slug: PageProps.appSlug(),
      workspace_slug: GlobalProps.workspaceSlug(),
      source: source,
      container_type: container?.userValues.type,
      container_unique_id: reference.id,
      container_image: container?.userValues.image,
      step_id: stepId,
      step_bundle_id: stepBundleId,
    });
  };

  return (
    <Tr key={reference.id}>
      <Td>
        <Text textStyle="body/md/regular" color="text/body" px="12" hasEllipsis>
          {reference.id}
        </Text>
        <Text textStyle="body/sm/regular" color="text/secondary" px="12" hasEllipsis>
          {container?.userValues.image}
        </Text>
      </Td>
      <Td>
        <Tooltip label="Edit containers in the Step bundle definition." isDisabled={!isDisabled}>
          <Box display="inline-block">
            <Checkbox
              isChecked={reference.recreate}
              onChange={(e) => onRecreate(reference.id, e.target.checked)}
              value={reference.id}
              isDisabled={isDisabled}
            >
              Recreate container
            </Checkbox>
          </Box>
        </Tooltip>
      </Td>
      <Td width="60px">
        <Box display="flex" justifyContent="center" pr="12">
          <ControlButton
            aria-label={isDisabled ? 'Edit containers in the Step bundle definition.' : 'Delete container'}
            iconName="MinusCircle"
            color="icon/negative"
            isDisabled={isDisabled}
            onClick={handleRemove}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default ContainerCardItem;

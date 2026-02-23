import { Box, Checkbox, ControlButton, Td, Text, Tooltip, Tr } from '@bitrise/bitkit';

import { Container, ContainerReference, ContainerType } from '@/core/models/Container';

type ContainerCardItemProps = {
  container?: Container;
  isDisabled?: boolean;
  onRecreate: (containerId: string, recreate: boolean, type: ContainerType) => void;
  onRemove: (containerId: string, type: ContainerType) => void;
  reference: ContainerReference;
  type: ContainerType;
};

const ContainerCardItem = ({
  container,
  isDisabled,
  onRecreate,
  onRemove,
  reference,
  type,
}: ContainerCardItemProps) => {
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
              onChange={(e) => onRecreate(reference.id, e.target.checked, type)}
              value={reference.id}
              isDisabled={isDisabled}
            >
              Recreate container
            </Checkbox>
            g
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
            onClick={() => onRemove(reference.id, type)}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default ContainerCardItem;

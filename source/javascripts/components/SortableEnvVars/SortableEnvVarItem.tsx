import { Box, Checkbox, ControlButton, Input, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

import AutoGrowableInput from '@/components/AutoGrowableInput';
import DragHandle from '@/components/DragHandle/DragHandle';
import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';

export type SortableEnvVar = EnvVar & {
  uniqueId: string;
};

export type SortableEnvVarItemProps = {
  env: SortableEnvVar;
  isDragging?: boolean;
  onRemove?: () => void;
  onKeyChange?: (key: string) => void;
  onValueChange?: (value: string) => void;
  onIsExpandChange?: (isExpand: boolean) => void;
};

const SortableEnvVarItem = ({
  env,
  isDragging,
  onRemove,
  onKeyChange,
  onValueChange,
  onIsExpandChange,
}: SortableEnvVarItemProps) => {
  const sortable = useSortable({ id: env.uniqueId, data: env });

  const [errors, setErrors] = useState({
    key: EnvVarService.validateKey(env.key),
  });

  const handleKeyChange = (key: string) => {
    onKeyChange?.(key);
    setErrors((prevErrors) => ({ ...prevErrors, key: EnvVarService.validateKey(key) }));
  };

  const handleValueChange = (value: string) => {
    onValueChange?.(value);
  };

  const handleIsExpandChange = (isExpand: boolean) => {
    onIsExpandChange?.(isExpand);
  };

  return (
    <Box
      ref={sortable.setNodeRef}
      display="flex"
      className="group"
      position="relative"
      borderBottom="1px solid"
      borderColor="border/minimal"
      {...(isDragging ? { boxShadow: 'small' } : {})}
      {...(sortable.isDragging
        ? { backgroundColor: 'background/secondary' }
        : { backgroundColor: 'background/primary' })}
      style={{
        transition: sortable.transition,
        transform: CSS.Transform.toString(sortable.transform),
      }}
    >
      <DragHandle
        withGroupHover
        ref={sortable.setActivatorNodeRef}
        visibility={sortable.isDragging ? 'hidden' : 'visible'}
        {...sortable.listeners}
        {...sortable.attributes}
      />
      <Box
        p="16"
        pl="8"
        gap="16"
        flex="1"
        display="flex"
        flexDir="column"
        visibility={sortable.isDragging ? 'hidden' : 'visible'}
      >
        <Box display="flex" alignItems="top" gap="8">
          <Input
            flex="1"
            size="md"
            value={env.key}
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            onChange={(e) => handleKeyChange(e.target.value)}
            errorText={errors.key !== true ? errors.key : undefined}
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
          />
          <Text color="text/tertiary" pt="8">
            =
          </Text>
          <AutoGrowableInput
            value={env.value}
            aria-label="Value"
            placeholder="Enter value"
            formControlProps={{ flex: 1 }}
            onChange={(e) => handleValueChange(e.target.value)}
          />
          <ControlButton
            isDanger
            ml="8"
            size="md"
            aria-label="Remove"
            iconName="MinusCircle"
            tooltipProps={{ 'aria-label': 'Remove' }}
            onClick={() => onRemove?.()}
          />
        </Box>
        <Checkbox isChecked={env.isExpand !== false} onChange={(e) => handleIsExpandChange(e.target.checked)}>
          Replace variables in inputs
        </Checkbox>
      </Box>
    </Box>
  );
};

export default SortableEnvVarItem;

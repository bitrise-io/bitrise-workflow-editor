import { Box, Checkbox, ControlButton, Input, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { omit } from 'es-toolkit';
import { useState } from 'react';

import AutoGrowableInput from '@/components/AutoGrowableInput';
import DragHandle from '@/components/DragHandle/DragHandle';
import EnvVarService from '@/core/services/EnvVarService';

import { EnvVarWithUniqueId } from '../../EnvVarsPage.types';

type Props = {
  env: EnvVarWithUniqueId;
  isDragging?: boolean;
  onRemove?: (uniqueId: string) => void;
  onChange?: (env: EnvVarWithUniqueId) => void;
};

const EnvVarsTableItem = ({ env, isDragging, onChange, onRemove }: Props) => {
  const sortable = useSortable({ id: env.uniqueId, data: env });

  const [errors, setErrors] = useState({
    key: EnvVarService.validateKey(env.key),
  });

  const handleKeyChange = (key: string) => {
    onChange?.({ ...env, key });
    setErrors((oldErrors) => ({
      ...oldErrors,
      key: EnvVarService.validateKey(key),
    }));
  };

  const handleValueChange = (value: string) => {
    onChange?.({ ...env, value });
  };

  const handleIsExpandChange = (isExpand: boolean) => {
    if (isExpand) {
      onChange?.(omit(env, ['isExpand']));
    } else {
      onChange?.({ ...env, isExpand: false });
    }
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
            onClick={() => onRemove?.(env.uniqueId)}
          />
        </Box>
        <Checkbox isChecked={env.isExpand !== false} onChange={(e) => handleIsExpandChange(e.target.checked)}>
          Replace variables in inputs
        </Checkbox>
      </Box>
    </Box>
  );
};

export default EnvVarsTableItem;

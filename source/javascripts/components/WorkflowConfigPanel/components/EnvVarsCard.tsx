import { CSSProperties } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button, ControlButton, ExpandableCard, Input, Text, Badge, Checkbox } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { FormValues } from '../WorkflowConfigPanel.types';
import AutoGrowableInput from './AutoGrowableInput';

const ButtonContent = () => {
  const {
    formState: { errors },
  } = useFormContext<FormValues>();

  const numberOfErrors =
    errors.configuration?.envs?.reduce?.((total, env) => {
      return total + Number(Boolean(env?.isExpand)) + Number(Boolean(env?.key)) + Number(Boolean(env?.value));
    }, 0) ?? 0;

  return (
    <Box display="flex" gap="8">
      <Text textStyle="body/lg/semibold">EnvVars</Text>
      {!!numberOfErrors && (
        <Badge variant="bold" colorScheme="negative">
          {numberOfErrors}
        </Badge>
      )}
    </Box>
  );
};

const DragHandleIcon = () => {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2" cy="2" r="1" />
      <circle cx="6" cy="2" r="1" />
      <circle cx="2" cy="6" r="1" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="6" cy="10" r="1" />
    </svg>
  );
};

const EnvVarCard = ({ id, index, onRemove }: { id: string; index: number; onRemove: (index: number) => void }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  const { attributes, listeners, active, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({ id });

  const handleRemove = () => {
    onRemove(index);
  };

  const isActive = active?.id === id;

  const style: CSSProperties = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  // NOTE: Default value doesn't apply because the ref connected to the FormControl instead the Checkbox component in Bitkit
  const { ref: isExpandRef, ...isExpandProps } = register(`configuration.envs.${index}.isExpand`);

  return (
    <Box
      ref={setNodeRef}
      style={style}
      display="flex"
      position="relative"
      borderBottom="1px solid"
      borderColor="border/minimal"
      background="background/primary"
      zIndex={isActive ? 9999 : 'auto'}
      boxShadow={isActive ? 'medium' : undefined}
    >
      <Box
        p="8"
        as="button"
        cursor="grab"
        display="flex"
        alignItems="center"
        ref={setActivatorNodeRef}
        color={isActive ? 'icon/secondary' : 'icon/tertiary'}
        background={isActive ? 'background/hover' : undefined}
        _hover={{ background: 'background/hover', color: 'icon/secondary' }}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon />
      </Box>
      <Box p="16" pl="8" display="flex" flexDir="column" gap="16" flex="1">
        <Box display="flex" alignItems="top" gap="8">
          <Input
            flex="1"
            size="md"
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            errorText={errors.configuration?.envs?.[index]?.key?.message?.toString()}
            {...register(`configuration.envs.${index}.key`, {
              required: {
                value: true,
                message: 'Key is required.',
              },
              pattern: {
                value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
                message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
              },
            })}
          />
          <Text color="text/tertiary" pt="8">
            =
          </Text>
          <AutoGrowableInput
            aria-label="Value"
            placeholder="Enter value"
            formControlProps={{ flex: 1 }}
            errorText={errors.configuration?.envs?.[index]?.value?.message?.toString()}
            {...register(`configuration.envs.${index}.value`, {
              required: {
                value: true,
                message: 'Value is required.',
              },
              validate: {
                isNotEmpty: (value) => !!value.trim() || 'Value should not be empty.',
              },
            })}
          />
          <ControlButton onClick={handleRemove} iconName="MinusRemove" aria-label="Remove" size="md" ml="8" isDanger />
        </Box>
        <Checkbox inputRef={isExpandRef} {...isExpandProps}>
          Replace variables in inputs
        </Checkbox>
      </Box>
    </Box>
  );
};

const EnvVarsCard = () => {
  const sensors = useSensors(useSensor(PointerSensor));
  const { fields, append, remove, move } = useFieldArray<FormValues, 'configuration.envs'>({
    name: 'configuration.envs',
  });

  const handleAddNew = () => {
    append({
      key: '',
      value: '',
      isExpand: false,
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    move(
      fields.findIndex((f) => f.id === e.active.id),
      fields.findIndex((f) => f.id === e.over?.id),
    );
  };

  return (
    <ExpandableCard buttonContent={<ButtonContent />}>
      <Box m="-16" width="auto">
        <Box>
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin} // NOTE: This is the only one that works when EnvVar has dozens of lines... :/
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={fields.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <EnvVarCard key={field.id} id={field.id} index={index} onRemove={remove} />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
        <Box px="32" py="24">
          <Button onClick={handleAddNew} leftIconName="PlusAdd" size="md" variant="secondary">
            Add new
          </Button>
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;

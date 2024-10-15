import { CSSProperties, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Badge, Box, Button, Checkbox, ControlButton, ExpandableCard, Input, Text } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, pointerWithin } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import EnvVarService from '@/core/models/EnvVarService';
import AutoGrowableInput from '@/components/AutoGrowableInput';
import DragHandle from '@/components/DragHandle/DragHandle';
import { EnvVar } from '@/core/models/EnvVar';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import { FormValues } from '../WorkflowConfig.types';

const ButtonContent = () => {
  const { formState } = useFormContext<FormValues>();

  const numberOfErrors =
    formState.errors.configuration?.envs?.reduce?.((total, env) => {
      return total + Number(Boolean(env?.isExpand)) + Number(Boolean(env?.key)) + Number(Boolean(env?.value));
    }, 0) ?? 0;

  return (
    <Box display="flex" gap="8">
      <Text textStyle="body/lg/semibold">Env Vars</Text>
      {!!numberOfErrors && (
        <Badge variant="bold" colorScheme="negative">
          {numberOfErrors}
        </Badge>
      )}
    </Box>
  );
};

const EnvVarCard = ({ id, index, onRemove }: { id: string; index: number; onRemove: (index: number) => void }) => {
  const { register, formState, watch, setValue } = useFormContext<FormValues>();
  const { attributes, listeners, active, transform, transition, setNodeRef, setActivatorNodeRef } = useSortable({ id });

  const handleRemove = () => {
    onRemove(index);
  };

  const isActive = active?.id === id;

  const style: CSSProperties = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

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
      <DragHandle ref={setActivatorNodeRef} {...attributes} {...listeners} />
      <Box p="16" pl="8" display="flex" flexDir="column" gap="16" flex="1">
        <Box display="flex" alignItems="top" gap="8">
          <Input
            flex="1"
            size="md"
            aria-label="Key"
            leftIconName="Dollars"
            placeholder="Enter key"
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            errorText={formState.errors.configuration?.envs?.[index]?.key?.message}
            {...register(`configuration.envs.${index}.key`, {
              validate: (v) => EnvVarService.validateKey(v),
            })}
          />
          <Text color="text/tertiary" pt="8">
            =
          </Text>
          <AutoGrowableInput
            aria-label="Value"
            placeholder="Enter value"
            formControlProps={{ flex: 1 }}
            errorText={formState.errors.configuration?.envs?.[index]?.value?.message}
            {...register(`configuration.envs.${index}.value`, {
              validate: EnvVarService.validateValue,
            })}
          />
          <ControlButton
            ml="8"
            size="md"
            aria-label="Remove"
            onClick={handleRemove}
            iconName="MinusCircle"
            tooltipProps={{ 'aria-label': 'Remove' }}
            isDanger
          />
        </Box>
        <Checkbox
          isChecked={Boolean(watch(`configuration.envs.${index}.isExpand`))}
          onChange={(e) => {
            const currentChecked = e.target.checked;
            const defaultChecked = formState.defaultValues?.configuration?.envs?.[index]?.isExpand;
            const updatedChecked = defaultChecked === undefined ? currentChecked || defaultChecked : currentChecked;

            setValue(`configuration.envs.${index}.isExpand`, updatedChecked, {
              shouldDirty: defaultChecked !== updatedChecked,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
        >
          Replace variables in inputs
        </Checkbox>
      </Box>
    </Box>
  );
};

const EnvVarsCard = () => {
  const workflow = useWorkflowConfigContext();
  const { control, formState } = useFormContext<FormValues>();
  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: 'configuration.envs',
  });

  const handleAddNew = () => {
    append({ source: workflow?.id || '', key: '', value: '', isExpand: false });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    move(
      fields.findIndex((f) => f.id === e.active.id),
      fields.findIndex((f) => f.id === e.over?.id),
    );
  };

  useEffect(() => {
    replace((formState.defaultValues?.configuration?.envs ?? []) as EnvVar[]);
  }, [formState.defaultValues?.configuration?.envs, replace]);

  // TODO: Make it better!
  useEffect(() => {
    const listener = (event: CustomEvent<EnvVar>) => {
      append(event.detail);
    };

    window.addEventListener('workflow::envs::created' as never, listener);

    return () => window.removeEventListener('workflow::envs::created' as never, listener);
  }, [append]);

  return (
    <ExpandableCard buttonContent={<ButtonContent />}>
      <Box m="-16" width="auto">
        <Box>
          <DndContext
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
          <Button onClick={handleAddNew} leftIconName="PlusCircle" size="md" variant="secondary">
            Add new
          </Button>
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;

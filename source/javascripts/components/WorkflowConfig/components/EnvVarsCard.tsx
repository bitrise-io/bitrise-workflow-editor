import { CSSProperties, useEffect, useMemo } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { Badge, Box, Button, Checkbox, ControlButton, ExpandableCard, Input, Text } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/models/EnvVarService';
import DragHandle from '@/components/DragHandle/DragHandle';
import AutoGrowableInput from '@/components/AutoGrowableInput';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type FormValues = {
  envs: EnvVar[];
};

const ButtonContent = () => {
  const {
    formState: { errors },
  } = useFormContext<FormValues>();

  const numberOfErrors =
    errors.envs?.reduce?.((total, env) => {
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

const EnvVarCard = ({ id, index, onRemove }: { id: string; index: number; onRemove: (index: number) => void }) => {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  const envVars = watch('envs', []).filter((_, idx) => idx !== index);
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
  const { ref: isExpandRef, ...isExpandProps } = register(`envs.${index}.isExpand`);

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
            errorText={errors.envs?.[index]?.key?.message}
            {...register(`envs.${index}.key`, {
              validate: (v) =>
                EnvVarService.validateKey(
                  v,
                  envVars.map((ev) => ev.key),
                ),
            })}
          />
          <Text color="text/tertiary" pt="8">
            =
          </Text>
          <AutoGrowableInput
            aria-label="Value"
            placeholder="Enter value"
            formControlProps={{ flex: 1 }}
            errorText={errors.envs?.[index]?.value?.message}
            {...register(`envs.${index}.value`, {
              validate: EnvVarService.validateValue,
              setValueAs: String,
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
  const { id: source, envs: envVarsFromYml } = useWorkflowConfigContext();

  const defaultValues = useMemo(
    () => ({
      envs: (envVarsFromYml ?? []).map((env) => EnvVarService.parseYmlEnvVar(env, source)),
    }),
    [envVarsFromYml, source],
  );

  const { reset, trigger, ...form } = useForm<FormValues>({
    mode: 'all',
    defaultValues,
    shouldUnregister: true,
  });

  const { fields, append, remove, move } = useFieldArray({
    name: 'envs',
    control: form.control,
  });

  const handleAddNew = () => {
    append({ source, key: '', value: '', isExpand: false });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    move(
      fields.findIndex((f) => f.id === e.active.id),
      fields.findIndex((f) => f.id === e.over?.id),
    );
  };

  // NOTE: Reset form default values when the selected workflow was changed.
  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  // NOTE: Trigger form validation when the selected workflow was changed.
  useEffect(() => {
    trigger();
  }, [trigger, form.formState.defaultValues]);

  return (
    <FormProvider reset={reset} trigger={trigger} {...form}>
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
    </FormProvider>
  );
};

export default EnvVarsCard;

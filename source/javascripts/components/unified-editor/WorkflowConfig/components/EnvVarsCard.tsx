import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, ControlButton, ExpandableCard, Input, Text } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useShallow } from 'zustand/react/shallow';
import omit from 'lodash/omit';
import { useDebounceCallback } from 'usehooks-ts';
import AutoGrowableInput from '@/components/AutoGrowableInput';
import DragHandle from '@/components/DragHandle/DragHandle';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import EnvVarService from '@/core/models/EnvVarService';
import { EnvVar, EnvVarYml } from '@/core/models/EnvVar';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type SortableEnvVar = EnvVar & {
  uniqueId: string;
};

function mapYmlEnvVarsToSortableEnvVars(envs?: EnvVarYml[], workflowId?: string): SortableEnvVar[] {
  return (envs ?? []).map((env) => {
    return { uniqueId: crypto.randomUUID(), ...EnvVarService.parseYmlEnvVar(env, workflowId) };
  });
}

const ButtonContent = () => {
  return (
    <Box display="flex" gap="8">
      <Text textStyle="body/lg/semibold">Env Vars</Text>
    </Box>
  );
};

type EnvVarCardProps = {
  env: SortableEnvVar;
  isDragging?: boolean;
  onRemove?: (uniqueId: string) => void;
  onChange?: (env: SortableEnvVar) => void;
};

const EnvVarCard = ({ env, isDragging, onRemove, onChange }: EnvVarCardProps) => {
  const sortable = useSortable({ id: env.uniqueId, data: env });

  const [errors, setErrors] = useState<{ key: string | boolean; value: string | boolean }>({
    key: EnvVarService.validateKey(env.key),
    value: EnvVarService.validateValue(env.value),
  });

  const handleKeyChange = (key: string) => {
    setErrors((oldErrors) => {
      const newErrors = { ...oldErrors, key: EnvVarService.validateKey(key) };

      if (Object.values(newErrors).every((error) => error === true)) {
        onChange?.({ ...env, key });
      }

      return newErrors;
    });
  };

  const handleValueChange = (value: string) => {
    setErrors((oldErrors) => {
      const newErrors = { ...oldErrors, value: EnvVarService.validateValue(value) };

      if (Object.values(newErrors).every((error) => error === true)) {
        onChange?.({ ...env, value });
      }

      return newErrors;
    });
  };

  if (sortable.isDragging) {
    return (
      <Box
        p="16"
        pb="56"
        ref={sortable.setNodeRef}
        backgroundColor="background/secondary"
        style={{
          transition: sortable.transition,
          transform: CSS.Transform.toString(sortable.transform),
        }}
      >
        <AutoGrowableInput visibility="hidden" value={env.value} formControlProps={{ flex: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      ref={sortable.setNodeRef}
      display="flex"
      className="group"
      position="relative"
      borderBottom="1px solid"
      borderColor="border/minimal"
      background="background/primary"
      {...(isDragging ? { boxShadow: 'small' } : {})}
      style={{
        transition: sortable.transition,
        transform: CSS.Transform.toString(sortable.transform),
      }}
    >
      <DragHandle withGroupHover ref={sortable.setActivatorNodeRef} {...sortable.listeners} {...sortable.attributes} />
      <Box p="16" pl="8" display="flex" flexDir="column" gap="16" flex="1">
        <Box display="flex" alignItems="top" gap="8">
          <Input
            flex="1"
            size="md"
            aria-label="Key"
            defaultValue={env.key}
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
            aria-label="Value"
            defaultValue={env.value}
            placeholder="Enter value"
            formControlProps={{ flex: 1 }}
            onChange={(e) => handleValueChange(e.target.value)}
            errorText={errors.value !== true ? errors.value : undefined}
          />
          <ControlButton
            isDanger
            ml="8"
            size="md"
            aria-label="Remove"
            iconName="MinusRemove"
            tooltipProps={{ 'aria-label': 'Remove' }}
            onClick={() => onRemove?.(env.uniqueId)}
          />
        </Box>
        <Checkbox
          isChecked={env.isExpand !== false}
          onChange={(e) => {
            if (e.target.checked) {
              onChange?.(omit(env, 'isExpand'));
            } else {
              onChange?.({ ...env, isExpand: false });
            }
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
  const [activeItem, setActiveItem] = useState<SortableEnvVar>();
  const [envs, setEnvs] = useState(mapYmlEnvVarsToSortableEnvVars(workflow?.userValues.envs, workflow?.id));
  const updateWorkflowEnvVars = useBitriseYmlStore(useShallow((s) => s.updateWorkflowEnvVars));
  const debouncedUpdateWorkflows = useDebounceCallback(updateWorkflowEnvVars, 150);

  const onDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as SortableEnvVar);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id.toString();
    const activeId = event.active.id.toString();

    if (activeId && overId) {
      setEnvs((oldEnvs) => {
        const currentOverIndex = oldEnvs.findIndex(({ uniqueId }) => uniqueId === overId);
        const currentActiveIndex = oldEnvs.findIndex(({ uniqueId }) => uniqueId === activeId);
        const newEnvVars = arrayMove(oldEnvs, currentActiveIndex, currentOverIndex);
        updateWorkflowEnvVars(workflow?.id || '', newEnvVars);
        return newEnvVars;
      });
    }

    setActiveItem(undefined);
  };

  const onDragCancel = () => {
    setActiveItem(undefined);
  };

  const onAddNewEnvVarClick = () => {
    setEnvs((oldEnvVars) => [
      ...oldEnvVars,
      { uniqueId: crypto.randomUUID(), key: '', value: '', source: workflow?.id || '', isExpand: false },
    ]);
  };

  const onRemoveEnvVar = (uniqueId: string) => {
    setEnvs((oldEnvVars) => {
      const newEnvVars = oldEnvVars.filter((env) => env.uniqueId !== uniqueId);
      updateWorkflowEnvVars(workflow?.id || '', newEnvVars);
      return newEnvVars;
    });
  };

  const onChangeEnvVar = (env: SortableEnvVar) => {
    setEnvs((oldEnvVars) => {
      const newEnvVars = oldEnvVars.map((oldEnvVar) => (oldEnvVar.uniqueId === env.uniqueId ? env : oldEnvVar));
      debouncedUpdateWorkflows(workflow?.id || '', newEnvVars);
      return newEnvVars;
    });
  };

  useEffect(() => {
    setEnvs(mapYmlEnvVarsToSortableEnvVars(workflow?.userValues.envs, workflow?.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  // TODO: Do it better!
  useEffect(() => {
    const listener = (event: CustomEvent<EnvVar>) => {
      setEnvs((oldEnvVars) => [...oldEnvVars, { uniqueId: crypto.randomUUID(), ...event.detail }]);
    };

    window.addEventListener('workflow::envs::created' as never, listener);

    return () => window.removeEventListener('workflow::envs::created' as never, listener);
  }, []);

  return (
    <ExpandableCard buttonContent={<ButtonContent />}>
      <Box m="-16" width="auto">
        <Box>
          <DndContext
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDragCancel={onDragCancel}
            collisionDetection={pointerWithin} // NOTE: This is the only one that works when EnvVar has dozens of lines... :/
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={envs.map(({ uniqueId }) => uniqueId)} strategy={verticalListSortingStrategy}>
              {envs.map((env) => (
                <EnvVarCard key={env.uniqueId} env={env} onRemove={onRemoveEnvVar} onChange={onChangeEnvVar} />
              ))}
            </SortableContext>
            <DragOverlay>{activeItem && <EnvVarCard env={activeItem} isDragging />}</DragOverlay>
          </DndContext>
        </Box>
        <Box px="32" py="24">
          <Button size="md" variant="secondary" leftIconName="PlusAdd" onClick={onAddNewEnvVarClick}>
            Add new
          </Button>
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;

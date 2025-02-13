import { useEffect, useState } from 'react';

import { omit } from 'es-toolkit';
import { CSS } from '@dnd-kit/utilities';
import { useDebounceCallback } from 'usehooks-ts';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge, Box, Button, Checkbox, ControlButton, ExpandableCard, Input, Text } from '@bitrise/bitkit';

import { EnvVar } from '@/core/models/EnvVar';
import { EnvModel } from '@/core/models/BitriseYml';
import EnvVarService from '@/core/services/EnvVarService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import DragHandle from '@/components/DragHandle/DragHandle';
import AutoGrowableInput from '@/components/AutoGrowableInput';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type SortableEnvVar = EnvVar & {
  uniqueId: string;
};

function getEnvKeysWithout(envs: SortableEnvVar[], uniqueId: string): string[] {
  return envs.filter((e) => e.uniqueId !== uniqueId).map((e) => e.key);
}

function countValidationErrors(envs: SortableEnvVar[]) {
  return envs.reduce((acc, env) => {
    const keyError = EnvVarService.validateKey(env.key);
    return acc + (keyError !== true ? 1 : 0);
  }, 0);
}

function mapYmlEnvVarsToSortableEnvVars(envs?: EnvModel, workflowId?: string): SortableEnvVar[] {
  return (envs ?? []).map((env) => {
    return {
      uniqueId: crypto.randomUUID(),
      ...EnvVarService.parseYmlEnvVar(env, workflowId),
    };
  });
}

const ButtonContent = ({ numberOfErrors }: { numberOfErrors: number }) => {
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

type EnvVarCardProps = {
  env: SortableEnvVar;
  keys: string[];
  isDragging?: boolean;
  onRemove?: (uniqueId: string) => void;
  onChange?: (env: SortableEnvVar) => void;
};

const EnvVarCard = ({ env, isDragging, onRemove, onChange }: EnvVarCardProps) => {
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
        <Checkbox
          isChecked={env.isExpand !== false}
          onChange={(e) => {
            if (e.target.checked) {
              onChange?.(omit(env, ['isExpand']));
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
  const updateWorkflowEnvVars = useBitriseYmlStore((s) => s.updateWorkflowEnvVars);
  const debouncedUpdateWorkflows = useDebounceCallback(updateWorkflowEnvVars, 250);

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
      {
        uniqueId: crypto.randomUUID(),
        key: '',
        value: '',
        source: workflow?.id || '',
        isExpand: false,
      },
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
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent numberOfErrors={countValidationErrors(envs)} />}
    >
      <Box m="-24px" width="auto">
        <Box>
          <DndContext
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDragCancel={onDragCancel}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={envs.map(({ uniqueId }) => uniqueId)} strategy={verticalListSortingStrategy}>
              {envs.map((env) => (
                <EnvVarCard
                  key={env.uniqueId}
                  env={env}
                  keys={getEnvKeysWithout(envs, env.uniqueId)}
                  onRemove={onRemoveEnvVar}
                  onChange={onChangeEnvVar}
                />
              ))}
            </SortableContext>
            <DragOverlay>{activeItem && <EnvVarCard env={activeItem} keys={[]} isDragging />}</DragOverlay>
          </DndContext>
        </Box>
        <Box p="24">
          <Button size="md" variant="secondary" leftIconName="PlusCircle" onClick={onAddNewEnvVarClick}>
            Add new
          </Button>
        </Box>
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;

import { Box, BoxProps, Button } from '@bitrise/bitkit';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect } from 'react';

import { EnvVarSource } from '@/core/models/EnvVar';

import SortableEnvVarItem from './SortableEnvVarItem';
import { useSortableEnvVars } from './useSortableEnvVars';

export type SortableEnvVarsProps = {
  containerProps?: BoxProps;
  source: EnvVarSource;
  sourceId?: string;
  listenForExternalChanges?: boolean;
  hideAddButton?: boolean;
  onValidationErrorsChange?: (errorCount: number) => void;
};

const SortableEnvVars = ({
  containerProps,
  source,
  sourceId,
  listenForExternalChanges = false,
  hideAddButton = false,
  onValidationErrorsChange,
}: SortableEnvVarsProps) => {
  const {
    envs,
    activeItem,
    onDragStart,
    onDragEnd,
    onDragCancel,
    onAdd,
    onRemove,
    onKeyChange,
    onValueChange,
    onIsExpandChange,
    countValidationErrors,
  } = useSortableEnvVars({ source, sourceId, listenForExternalChanges });

  useEffect(() => {
    if (onValidationErrorsChange) {
      const errorCount = countValidationErrors();
      onValidationErrorsChange(errorCount);
    }
  }, [envs, countValidationErrors, onValidationErrorsChange]);

  return (
    <Box {...containerProps}>
      <DndContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={envs.map(({ uniqueId }) => uniqueId)} strategy={verticalListSortingStrategy}>
          {envs.map((env, index) => (
            <SortableEnvVarItem
              key={env.uniqueId}
              env={env}
              onRemove={onRemove(index)}
              onKeyChange={onKeyChange(index)}
              onValueChange={onValueChange(index)}
              onIsExpandChange={onIsExpandChange(index)}
            />
          ))}
        </SortableContext>
        <DragOverlay>{activeItem && <SortableEnvVarItem env={activeItem} isDragging />}</DragOverlay>
      </DndContext>

      {!hideAddButton && (
        <Box px="16" py="12">
          <Button size="md" variant="tertiary" leftIconName="Plus" onClick={onAdd}>
            Add new
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SortableEnvVars;

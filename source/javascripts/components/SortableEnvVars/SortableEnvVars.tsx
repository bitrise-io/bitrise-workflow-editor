import { Box, BoxProps, Button, Text } from '@bitrise/bitkit';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ReactNode, useEffect } from 'react';

import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';
import { useIsReadOnlyView } from '@/hooks/useTree';

import SortableEnvVarItem, { SortableEnvVar } from './SortableEnvVarItem';
import { useSortableEnvVars } from './useSortableEnvVars';

export type SortableEnvVarsProps = {
  containerProps?: BoxProps;
  source: EnvVarSource;
  sourceId?: string;
  listenForExternalChanges?: boolean;
  hideAddButton?: boolean;
  onValidationErrorsChange?: (errorCount: number) => void;
  /** Display these env vars instead of reading from the store (merged read-only per-file grouping). */
  initialEnvs?: EnvVar[];
  /** Read-only views: render a jump-to-definition arrow per row in place of the remove button. */
  renderJumpButton?: (env: SortableEnvVar) => ReactNode;
  /** Placeholder shown on read-only views when there are no env vars (and thus no "Add new" button). */
  emptyText?: string;
};

const SortableEnvVars = ({
  containerProps,
  source,
  sourceId,
  listenForExternalChanges = false,
  hideAddButton = false,
  onValidationErrorsChange,
  initialEnvs,
  renderJumpButton,
  emptyText,
}: SortableEnvVarsProps) => {
  const isReadOnlyView = useIsReadOnlyView();
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
  } = useSortableEnvVars({ source, sourceId, listenForExternalChanges, initialEnvs });

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
              jumpButton={isReadOnlyView ? renderJumpButton?.(env) : undefined}
            />
          ))}
        </SortableContext>
        <DragOverlay>{activeItem && <SortableEnvVarItem env={activeItem} isDragging />}</DragOverlay>
      </DndContext>

      {/* Read-only view with nothing to show (no rows, no "Add new") would leave an empty box. */}
      {isReadOnlyView && envs.length === 0 && emptyText && (
        <Text paddingInline="24" paddingBlock="16" textStyle="body/md/regular" color="text/secondary">
          {emptyText}
        </Text>
      )}

      {/* Read-only views (merged config, cross-repo/ref files) can't add — show no action. */}
      {!hideAddButton && !isReadOnlyView && (
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

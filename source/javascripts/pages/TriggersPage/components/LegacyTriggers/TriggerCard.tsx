import {
  BitkitCheckbox,
  BitkitDraggableCard,
  BitkitIconButton,
  IconArrowRight,
  IconMinusCircle,
  IconPencil,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SyntheticEvent, useCallback, useMemo, useRef } from 'react';

import TriggerConditions from '@/components/unified-editor/Triggers/TriggerConditions';
import { trackTriggerEnabledToggled } from '@/core/analytics/TriggerAnalytics';
import { TriggerSource } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import { useIsReadOnlyView } from '@/hooks/useTree';

type TriggerCardProps = {
  triggerItem: LegacyTrigger;
  isOverlay?: boolean;
  onRemove?: (triggerItem: LegacyTrigger) => void;
  onEdit?: (triggerItem: LegacyTrigger) => void;
  onActiveChange?: (triggerItem: LegacyTrigger) => void;
};

const TriggerCard = (props: TriggerCardProps) => {
  const { isOverlay, triggerItem, onRemove, onEdit, onActiveChange } = props;
  const isReadOnlyView = useIsReadOnlyView();
  const { conditions, source, isDraftPr, isActive } = triggerItem;
  const [target, targetId] = source.split('#') as [TriggerSource, string];

  const { isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: triggerItem.uniqueId,
    disabled: isReadOnlyView,
  });

  // BitkitDraggableCard's handle only takes a ref (it is built for @dnd-kit/react), so the @dnd-kit/core
  // listeners sit on the card and pass on only the events that start on the handle.
  const handleNode = useRef<HTMLButtonElement | null>(null);
  const handleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      handleNode.current = node;
      setActivatorNodeRef(node);
    },
    [setActivatorNodeRef],
  );
  const handleListeners = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(listeners ?? {}).map(([eventName, listener]) => [
          eventName,
          (event: SyntheticEvent) => {
            if (handleNode.current?.contains(event.target as Node)) {
              listener(event);
            }
          },
        ]),
      ),
    [listeners],
  );

  const handleRemove = () => {
    if (onRemove) {
      onRemove(triggerItem);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(triggerItem);
    }
  };

  const handleActiveChange = () => {
    if (onActiveChange) {
      const newTriggerItem = { ...triggerItem, isActive: !isActive };
      onActiveChange(newTriggerItem);
      trackTriggerEnabledToggled(newTriggerItem, 'trigger_map');
    }
  };

  return (
    <BitkitDraggableCard
      ref={setNodeRef}
      handleRef={handleRef}
      isDragging={isOverlay}
      isDropTarget={isDragging && !isOverlay}
      marginBottom="12"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...handleListeners}
    >
      <Box display="flex">
        <Box flex="1" minWidth="0" paddingInlineEnd="16" display="flex" flexDirection="column" gap="4">
          <Text textStyle="body/md/semibold">Trigger conditions</Text>
          <TriggerConditions conditions={conditions} isDraftPr={isDraftPr} triggerType={triggerItem.triggerType} />
        </Box>
        <Box flex="1" minWidth="0" paddingInlineEnd="16" display="flex" alignItems="center">
          <IconArrowRight marginInlineEnd="16" />
          <Box display="flex" flexDirection="column" gap="4">
            <Text>{targetId}</Text>
            <Text textStyle="body/md/regular" color="text/secondary">
              {target === 'workflows' ? 'Workflow' : 'Pipeline'}
            </Text>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <BitkitCheckbox
            labelText="Active"
            marginInlineEnd="16"
            checked={isActive}
            state={isReadOnlyView ? 'disabled' : undefined}
            onCheckedChange={() => handleActiveChange()}
          />
          {/* Read-only (merged/ghost) view has no edit/remove CTAs — hidden, not disabled (BIVS-3721). */}
          {!isReadOnlyView && (
            <>
              <BitkitIconButton icon={IconPencil} label="Edit trigger" variant="tertiary" onClick={handleEdit} />
              <BitkitIconButton
                icon={IconMinusCircle}
                label="Remove trigger"
                variant="danger-tertiary"
                onClick={handleRemove}
              />
            </>
          )}
        </Box>
      </Box>
    </BitkitDraggableCard>
  );
};

export default TriggerCard;

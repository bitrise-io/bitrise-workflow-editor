/* eslint-disable react-hooks/immutability */
import {
  BitkitActionMenu,
  BitkitControlButton,
  IconBlockCircle,
  IconMoreVertical,
  IconPencil,
  IconPlay,
  IconTrash,
} from '@bitrise/bitkit-v2';
import { Box } from 'chakra-ui-2--react';

import { TargetBasedTrigger } from '@/core/models/Trigger';

import TriggerConditions from '../TriggerConditions';

type Props = {
  trigger: TargetBasedTrigger;
  triggersEnabled: boolean;
  isReadOnly: boolean;
  onUpdateEnabled: (trigger: TargetBasedTrigger) => void;
  onEditTrigger: (trigger: TargetBasedTrigger) => void;
  onDeleteTrigger: (trigger: TargetBasedTrigger) => void;
};

const TargetBasedTriggerItem = (props: Props) => {
  const { trigger, triggersEnabled, isReadOnly, onUpdateEnabled, onEditTrigger, onDeleteTrigger } = props;
  const triggerDisabled = !trigger.isActive;
  return (
    <Box
      padding="16px 20px 16px 24px"
      borderBlockEnd="1px solid"
      borderBlockEndColor="border/minimal"
      display="flex"
      gap="16"
      justifyContent="space-between"
    >
      <TriggerConditions
        conditions={trigger.conditions}
        isDraftPr={trigger.isDraftPr}
        triggerType={trigger.triggerType}
        priority={trigger.priority}
        triggerDisabled={!triggersEnabled || triggerDisabled}
      />
      {/* The menu only holds mutating actions, so it's hidden entirely in read-only/ghost views. */}
      {!isReadOnly && (
        <BitkitActionMenu trigger={<BitkitControlButton icon={IconMoreVertical} label="Open menu" />}>
          <BitkitActionMenu.Item icon={IconPencil} onClick={() => onEditTrigger(trigger)}>
            Edit trigger
          </BitkitActionMenu.Item>
          <BitkitActionMenu.Item
            icon={triggerDisabled ? IconPlay : IconBlockCircle}
            onClick={() => {
              trigger.isActive = !trigger.isActive;
              onUpdateEnabled(trigger);
            }}
          >
            {triggerDisabled ? 'Enable trigger' : 'Disable trigger'}
          </BitkitActionMenu.Item>
          <BitkitActionMenu.Item isDanger icon={IconTrash} onClick={() => onDeleteTrigger(trigger)}>
            Delete trigger
          </BitkitActionMenu.Item>
        </BitkitActionMenu>
      )}
    </Box>
  );
};

export default TargetBasedTriggerItem;

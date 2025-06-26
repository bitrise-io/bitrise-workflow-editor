import { Button, ButtonGroup, Tooltip } from '@bitrise/bitkit';
import { isEqual } from 'es-toolkit';
import { useFormContext } from 'react-hook-form';

import { trackAddTrigger, trackEditTrigger } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';

type Props = {
  editedItem?: TargetBasedTrigger | LegacyTrigger;
  onCancel: () => void;
  currentTriggers?: (TargetBasedTrigger | LegacyTrigger)[];
  variant: 'legacy' | 'target-based';
};

const TriggerFormFooter = (props: Props) => {
  const { editedItem, onCancel, currentTriggers = [], variant } = props;
  const { reset, watch } = useFormContext<TargetBasedTrigger | LegacyTrigger>();
  const { conditions, isDraftPr, priority, source } = watch();

  let isSameTriggerExist = false;
  currentTriggers.forEach((trigger) => {
    if (
      trigger.uniqueId !== editedItem?.uniqueId &&
      isEqual(trigger.conditions, conditions) &&
      isEqual(trigger.isDraftPr, isDraftPr) &&
      isEqual(trigger.priority, priority)
    ) {
      isSameTriggerExist = true;
    }
  });

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if (
      (!(
        type === 'name' ||
        type === 'tag' ||
        type === 'target_branch' ||
        type === 'pull_request_target_branch' ||
        type === 'source_branch' ||
        type === 'pull_request_source_branch' ||
        type === 'branch' ||
        type === 'push_branch'
      ) &&
        !value) ||
      !type
    ) {
      hasEmptyCondition = true;
    }
  });

  const hasNoTarget = variant === 'legacy' && !editedItem && !source;

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSegmentTrack = () => {
    if (editedItem) {
      trackEditTrigger(watch());
    } else {
      trackAddTrigger(watch());
    }
  };

  return (
    <ButtonGroup spacing="16">
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Tooltip
        isDisabled={!isSameTriggerExist && !hasEmptyCondition}
        label={
          isSameTriggerExist
            ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
            : 'Please fill all conditions.'
        }
      >
        <Button
          type="submit"
          onClick={handleSegmentTrack}
          isDisabled={isSameTriggerExist || hasEmptyCondition || hasNoTarget}
        >
          {editedItem ? 'Apply changes' : 'Add trigger'}
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default TriggerFormFooter;

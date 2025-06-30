import { Button, ButtonGroup, Tooltip } from '@bitrise/bitkit';
import { isEqual } from 'es-toolkit';
import { useFormContext } from 'react-hook-form';

import { trackAddTrigger, trackEditTrigger } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';

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

  const hasEmptyCondition = conditions.some(
    ({ type, value }) => (TriggerService.requiredField(type) && !value) || !type,
  );

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

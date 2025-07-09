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
};

const TriggerFormFooter = (props: Props) => {
  const { editedItem, onCancel, currentTriggers = [] } = props;
  const { reset, watch } = useFormContext<TargetBasedTrigger | LegacyTrigger>();
  const { conditions, isDraftPr, priority, source } = watch();

  let isSameTriggerExist = false;
  currentTriggers.forEach((trigger) => {
    // When draft PR is included it isn't appears in the yml so it's default value is undefined.
    // When draft PR is excluded draft_enabled field appears with false value.
    const currentIsPullRequest = trigger.triggerType === 'pull_request';
    const currentIsDraftPr = trigger.isDraftPr === undefined ? true : trigger.isDraftPr;
    if (
      trigger.uniqueId !== editedItem?.uniqueId &&
      isEqual(trigger.conditions, conditions) &&
      (!currentIsPullRequest || isEqual(currentIsDraftPr, isDraftPr)) &&
      isEqual(trigger.priority, priority) &&
      isEqual(trigger.source, source)
    ) {
      isSameTriggerExist = true;
    }
  });

  const hasEmptyCondition = conditions.some(
    ({ type, value }) => (TriggerService.requiredField(type) && !value) || !type,
  );

  const hasNoTarget = !editedItem && !source;

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

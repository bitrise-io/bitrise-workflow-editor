import { Button, ButtonGroup, Tooltip } from '@bitrise/bitkit';
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
  const formValues = watch();
  const { conditions, source } = formValues;

  const isSameTriggerExist = TriggerService.checkExistingTrigger(formValues, currentTriggers, editedItem);
  const hasEmptyCondition = conditions.some(
    ({ type, value }) => (TriggerService.requiredField(type) && !value) || !type,
  );

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSegmentTrack = () => {
    if (editedItem) {
      trackEditTrigger(formValues);
    } else {
      trackAddTrigger(formValues);
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
          isDisabled={isSameTriggerExist || hasEmptyCondition || !source}
        >
          {editedItem ? 'Apply changes' : 'Add trigger'}
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default TriggerFormFooter;

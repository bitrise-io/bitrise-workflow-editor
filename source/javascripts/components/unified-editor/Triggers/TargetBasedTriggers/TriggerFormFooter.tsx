import { ButtonGroup, Tooltip } from '@bitrise/bitkit';
import { BitkitButton } from '@bitrise/bitkit-v2';
import { useFormContext } from 'react-hook-form';

import { trackAddTrigger, trackEditTrigger } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';
import WindowUtils from '@/core/utils/WindowUtils';

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

  const handleSubmit = () => {
    if (editedItem) {
      trackEditTrigger(formValues);
    } else {
      trackAddTrigger(formValues);
    }

    WindowUtils.postMessageToParent('TRIGGERS_EDITED');
  };

  return (
    <ButtonGroup spacing="16">
      <BitkitButton variant="secondary" onClick={handleCancel}>
        Cancel
      </BitkitButton>
      <Tooltip
        isDisabled={!isSameTriggerExist && !hasEmptyCondition}
        label={
          isSameTriggerExist
            ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
            : 'Please fill all conditions.'
        }
      >
        <BitkitButton
          type="submit"
          onClick={handleSubmit}
          state={isSameTriggerExist || hasEmptyCondition || !source ? 'disabled' : undefined}
        >
          {editedItem ? 'Apply changes' : 'Add trigger'}
        </BitkitButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export default TriggerFormFooter;

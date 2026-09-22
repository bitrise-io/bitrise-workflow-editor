import { useToast } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

import { TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';

type Props = {
  triggers: Record<TriggerType, LegacyTrigger[]>;
};

const canConvertSafely = (triggers: Props['triggers']): boolean => {
  // If there is 1 or 0 item per type -> return true
  return Object.values(triggers).every((type) => type.length < 2);
};

const ConvertLegacyTriggers = ({ triggers }: Props) => {
  const toast = useToast();

  if (!canConvertSafely(triggers)) {
    return null;
  }

  const onClick = () => {
    const legacyTriggers = Object.values(triggers).flat();
    legacyTriggers.forEach((trigger) => {
      const targetBasedTrigger = TriggerService.convertToTargetBasedTrigger(trigger);
      TriggerService.addTrigger(targetBasedTrigger);
    });

    // Remove legacy triggers
    TriggerService.updateTriggerMap(undefined);

    toast({
      isClosable: true,
      status: 'success',
      title: 'Successful conversion',
      description: 'Legacy triggers converted to new format.',
    });
  };

  return (
    <BitkitAlert
      action={{
        label: 'Convert triggers',
        onClick,
      }}
      marginBlockStart="16"
      variant="info"
      data-clarity-unmask="true"
      titleText="Convert legacy triggers to the new format"
      messageText="Make sure to check the converted triggers before saving."
    />
  );
};

export default ConvertLegacyTriggers;

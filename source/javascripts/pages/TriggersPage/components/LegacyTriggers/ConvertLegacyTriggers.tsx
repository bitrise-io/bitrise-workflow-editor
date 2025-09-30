import { Notification, Text, useToast } from '@bitrise/bitkit';

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
    <Notification
      action={{
        label: 'Convert triggers',
        onClick,
      }}
      marginBlockStart="16"
      status="info"
    >
      <Text as="h4" textStyle="comp/notification/title">
        Convert legacy triggers to the new format
      </Text>
      Make sure to check the converted triggers before saving.
    </Notification>
  );
};

export default ConvertLegacyTriggers;

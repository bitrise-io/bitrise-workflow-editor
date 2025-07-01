import { Dialog, DialogBody, DialogFooter } from '@bitrise/bitkit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  TARGET_BASED_OPTIONS_MAP,
  TargetBasedConditionType,
  TargetBasedTrigger,
  TriggerSource,
  TriggerType,
} from '@/core/models/Trigger';
import { LEGACY_OPTIONS_MAP, LegacyConditionType, LegacyTrigger } from '@/core/models/Trigger.legacy';

import TriggerFormBody from './TriggerFormBody';
import TriggerFormFooter from './TriggerFormFooter';

type Props = {
  source: TriggerSource | '';
  sourceId: string;
  triggerType: TriggerType;
  editedItem?: TargetBasedTrigger | LegacyTrigger;
  currentTriggers: TargetBasedTrigger[] | LegacyTrigger[];
  onSubmit: (trigger: any) => void;
  onCancel: () => void;
  isOpen: boolean;
  variant: 'legacy' | 'target-based';
};

const AddOrEditTriggerDialog = (props: Props) => {
  const { source, sourceId, editedItem, currentTriggers, triggerType, onCancel, onSubmit, isOpen, variant } = props;

  const defaultValues = useMemo(() => {
    const commonProps = {
      uniqueId: editedItem?.uniqueId || crypto.randomUUID(),
      index: editedItem?.index || currentTriggers.length,
      triggerType,
      isActive: true,
      isDraftPr: true,
    };

    if (variant === 'legacy') {
      const legacyOptionsMap = LEGACY_OPTIONS_MAP[triggerType];
      const legacyDefaults: LegacyTrigger = {
        ...commonProps,
        conditions: [
          {
            type: Object.keys(legacyOptionsMap)[0] as LegacyConditionType,
            value: '',
            isRegex: false,
          },
        ],
        source: '',
      };

      if (editedItem) {
        return { ...legacyDefaults, ...editedItem };
      }

      return legacyDefaults;
    }

    const targetOptionsMap = TARGET_BASED_OPTIONS_MAP[triggerType];
    const targetBasedDefaults: TargetBasedTrigger = {
      ...commonProps,
      conditions: [
        {
          type: Object.keys(targetOptionsMap)[0] as TargetBasedConditionType,
          value: '',
          isRegex: false,
        },
      ],
      source: source && sourceId && `${source}#${sourceId}`,
    };

    if (editedItem) {
      return { ...targetBasedDefaults, ...editedItem };
    }

    return targetBasedDefaults;
  }, [currentTriggers.length, editedItem, source, sourceId, triggerType, variant]);

  const formMethods = useForm<TargetBasedTrigger | LegacyTrigger>({ defaultValues });
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen]);

  const onFormSubmit = (data: TargetBasedTrigger | LegacyTrigger) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = newCondition.isRegex ? '.*' : '*';
      }
      return newCondition;
    }) as TargetBasedTrigger['conditions'] | LegacyTrigger['conditions'];

    onSubmit(filteredData);
  };

  const title = editedItem
    ? `Edit ${triggerType.replace('_', ' ')} trigger`
    : `Add ${triggerType.replace('_', ' ')} trigger`;

  return (
    <FormProvider {...formMethods}>
      <Dialog
        as="form"
        maxWidth="640"
        isOpen={isOpen}
        onClose={onCancel}
        title={title}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          <TriggerFormBody source={source} triggerType={triggerType} variant={variant} />
        </DialogBody>
        <DialogFooter>
          <TriggerFormFooter
            editedItem={editedItem}
            onCancel={onCancel}
            currentTriggers={currentTriggers}
            variant={variant}
          />
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default AddOrEditTriggerDialog;

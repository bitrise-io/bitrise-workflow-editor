import { Checkbox, Link, Select } from '@bitrise/bitkit';
import { useMemo } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import {
  TARGET_BASED_LABELS_MAP,
  TARGET_BASED_OPTIONS_MAP,
  TargetBasedConditionType,
  TargetBasedTrigger,
  TriggerSource,
  TriggerType,
  TriggerVariant,
} from '@/core/models/Trigger';
import {
  LEGACY_LABELS_MAP,
  LEGACY_OPTIONS_MAP,
  LegacyConditionType,
  LegacyTrigger,
} from '@/core/models/Trigger.legacy';
import usePipelineIds from '@/hooks/usePipelineIds';
import useWorkflowIds from '@/hooks/useWorkflowIds';

import PriorityInput from '../../PriorityInput/PriorityInput';
import ConditionCard from '../ConditionCard';

type Props = {
  source: TriggerSource | '';
  triggerType: TriggerType;
  variant: TriggerVariant;
};

const TriggerFormBody = (props: Props) => {
  const { source, triggerType, variant } = props;
  const pipelines = usePipelineIds();
  const workflows = useWorkflowIds(true);

  const { control, setValue, watch } = useFormContext<TargetBasedTrigger | LegacyTrigger>();
  const { conditions, isDraftPr, priority } = watch();
  const { append, fields, remove } = useFieldArray({ control, name: 'conditions', keyName: 'uniqueId' });

  const optionsMap = useMemo(() => {
    return variant === 'legacy' ? LEGACY_OPTIONS_MAP[triggerType] : TARGET_BASED_OPTIONS_MAP[triggerType];
  }, [triggerType, variant]);

  const labelsMap = useMemo(() => {
    return variant === 'legacy' ? LEGACY_LABELS_MAP[triggerType] : TARGET_BASED_LABELS_MAP[triggerType];
  }, [triggerType, variant]);

  const entity = useMemo(() => (source === 'pipelines' ? 'Pipeline' : 'Workflow'), [source]);

  const onAppend = () => {
    const availableTypes = Object.keys(optionsMap) as TargetBasedConditionType[] | LegacyConditionType[];
    const usedTypes = conditions.map((condition) => condition.type);
    const newType = availableTypes.find((type) => !usedTypes.includes(type));

    if (!newType) {
      return;
    }

    append({
      type: newType,
      value: '',
      isRegex: false,
    });
  };

  return (
    <>
      {(variant === 'legacy' || variant === 'triggers-target-based') && (
        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <Select label="Target" placeholder="Select a Pipeline or Workflow" isRequired mb="24" {...field}>
              {pipelines.length > 0 && (
                <optgroup label="Pipelines">
                  {pipelines.map((p) => (
                    <option key={p} value={`pipelines#${p}`}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              )}
              {workflows.length > 0 && (
                <optgroup label="Workflows">
                  {workflows.map((p) => (
                    <option key={p} value={`workflows#${p}`}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          )}
        />
      )}
      <ConditionCard
        triggerType={triggerType}
        fields={fields}
        labelsMap={labelsMap}
        append={onAppend}
        optionsMap={optionsMap}
        remove={remove}
      />
      {triggerType === 'pull_request' && (
        <Checkbox
          isChecked={isDraftPr !== false}
          marginBlockStart="24"
          helperText={
            <>
              Supported for GitHub and GitLab.{' '}
              <Link
                colorScheme="purple"
                href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html#triggering-builds-from-draft-prs"
                isExternal
              >
                Learn more
              </Link>
            </>
          }
          onChange={(e) => setValue(`isDraftPr`, e.target.checked)}
        >
          Include draft pull requests
        </Checkbox>
      )}
      {variant === 'target-based' && (
        <PriorityInput
          onChange={(newValue) => setValue('priority', newValue)}
          value={priority}
          helperText={`Assign a priority to builds started by this trigger. 
            Enter a value from -100 (lowest) to +100 (highest). This setting overrides 
            the priority assigned to this ${entity}.`}
          mt="24"
        />
      )}
    </>
  );
};

export default TriggerFormBody;

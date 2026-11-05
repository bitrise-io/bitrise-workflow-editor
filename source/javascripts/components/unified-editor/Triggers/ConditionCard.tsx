import { Select, Toggletip } from '@bitrise/bitkit';
import {
  BitkitButton,
  BitkitCheckbox,
  BitkitControlButton,
  BitkitTable,
  BitkitTextInput,
  BitkitToggleButton,
  IconInfoCircle,
  IconPlus,
  IconRegex,
  IconTrash,
} from '@bitrise/bitkit-v2';
import { Card } from '@chakra-ui/react/card';
import { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { TargetBasedTrigger, TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import TriggerService from '@/core/services/TriggerService';

type Props = {
  triggerType?: TriggerType;
  fields: FieldArrayWithId<LegacyTrigger | TargetBasedTrigger, 'conditions', 'uniqueId'>[];
  append?: () => void;
  optionsMap: Record<string, string>;
  remove: (index: number) => void;
  labelsMap: Record<string, string>;
};

const CONDITION_HELPERTEXT_MAP: Record<string, string> = {
  branch: 'If you leave it blank, Bitrise will start builds for any branch.',
  push_branch: 'If you leave it blank, Bitrise will start builds for any branch.',
  target_branch: 'If you leave it blank, Bitrise will start builds for any target branch.',
  pull_request_target_branch: 'If you leave it blank, Bitrise will start builds for any target branch.',
  source_branch: 'If you leave it blank, Bitrise will start builds for any source branch.',
  pull_request_source_branch: 'If you leave it blank, Bitrise will start builds for any source branch.',
  name: 'If you leave it blank, Bitrise will start builds for any tag.',
  tag: 'If you leave it blank, Bitrise will start builds for any tag.',
};

const ConditionCard = ({ triggerType, fields, append, optionsMap, remove }: Props) => {
  const { control, watch, setValue } = useFormContext<LegacyTrigger | TargetBasedTrigger>();
  const { conditions } = watch();

  const isTagCondition = useMemo(() => {
    return conditions.some((condition) => condition.type === 'name' || condition.type === 'tag');
  }, [conditions]);

  return (
    <Card.Root elevation={false} overflow="hidden">
      {/* A plain card, not BitkitTableCard: that one always renders a title bar, and this table has no title. */}
      <Card.Body padding="0">
        <BitkitTable.Root variant="card" rowHover={false} tableLayout="fixed">
          <BitkitTable.Header data-clarity-unmask="true">
            <BitkitTable.Row>
              <BitkitTable.ColumnHeader width="35%">Condition</BitkitTable.ColumnHeader>
              <BitkitTable.ColumnHeader>Value</BitkitTable.ColumnHeader>
              {!isTagCondition && <BitkitTable.ColumnHeader width="64" />}
            </BitkitTable.Row>
          </BitkitTable.Header>
          <BitkitTable.Body>
            {fields.map((fieldItem, index) => {
              const cond = conditions[index] || {};
              const { isLastCommitOnly, isRegex, type } = cond;
              const isRequired = TriggerService.requiredField(type);

              return (
                <BitkitTable.Row key={fieldItem.uniqueId}>
                  <BitkitTable.Cell height="auto" paddingBlock="12" verticalAlign="top">
                    <Controller
                      name={`conditions.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select placeholder="Select a condition type" size="md" {...field}>
                          {Object.entries(optionsMap).map(([optionType, text]) => {
                            const isConditionTypeUsed = conditions.some((condition) => condition.type === optionType);
                            const isTypeOfCurrentCard = optionType === type;

                            if (isConditionTypeUsed && !isTypeOfCurrentCard) {
                              return undefined;
                            }

                            return (
                              <option key={optionType} value={optionType}>
                                {text}
                              </option>
                            );
                          })}
                        </Select>
                      )}
                    />
                    {triggerType === 'push' && (type === 'changed_files' || type === 'commit_message') && (
                      <BitkitCheckbox
                        labelText={
                          <>
                            Last commit only
                            <Toggletip label="When checked, only the latest commit message is evaluated. When unchecked, all commits in a push are evaluated.">
                              <IconInfoCircle size="16" marginInlineStart="4" />
                            </Toggletip>
                          </>
                        }
                        marginBlockStart="12"
                        whiteSpace="nowrap"
                        checked={!!isLastCommitOnly}
                        onCheckedChange={({ checked }) =>
                          setValue(`conditions.${index}.isLastCommitOnly`, checked === true)
                        }
                      />
                    )}
                  </BitkitTable.Cell>
                  <BitkitTable.Cell height="auto" paddingBlock="12" verticalAlign="top">
                    <Controller
                      name={`conditions.${index}.value`}
                      render={({ field }) => (
                        <BitkitTextInput
                          value={field.value}
                          onValueChange={(value) => field.onChange(value.trimStart())}
                          inputProps={{
                            name: field.name,
                            onBlur: field.onBlur,
                            required: isRequired,
                          }}
                          placeholder={isRegex ? '.*' : '*'}
                          helperText={type ? CONDITION_HELPERTEXT_MAP[type] : undefined}
                          size="md"
                          startElement={
                            <BitkitToggleButton
                              icon={IconRegex}
                              label="Use regex pattern. Bitrise uses Ruby's Regexp#match method."
                              size="sm"
                              isSelected={isRegex}
                              onSelectedChange={(selected) => setValue(`conditions.${index}.isRegex`, selected)}
                            />
                          }
                        />
                      )}
                    />
                  </BitkitTable.Cell>
                  {!isTagCondition && (
                    <BitkitTable.Cell height="auto" paddingBlock="12" verticalAlign="top" paddingInlineStart="0">
                      <BitkitControlButton
                        icon={IconTrash}
                        label="Remove"
                        tooltipProps={{ disabled: fields.length === 1 }}
                        size="md"
                        isDanger
                        state={fields.length === 1 ? 'disabled' : undefined}
                        onClick={() => remove(index)}
                      />
                    </BitkitTable.Cell>
                  )}
                </BitkitTable.Row>
              );
            })}
          </BitkitTable.Body>
          {!isTagCondition && (
            <BitkitTable.Footer>
              <BitkitTable.Row>
                {/* A footer cell has no padding of its own; this lines the button's label up with the column text. */}
                <BitkitTable.Cell colSpan={3} paddingBlock="12" paddingInline="12">
                  <BitkitButton
                    variant="tertiary"
                    size="md"
                    icon={IconPlus}
                    onClick={append}
                    state={fields.length >= Object.keys(optionsMap).length ? 'disabled' : undefined}
                  >
                    Add condition
                  </BitkitButton>
                </BitkitTable.Cell>
              </BitkitTable.Row>
            </BitkitTable.Footer>
          )}
        </BitkitTable.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default ConditionCard;

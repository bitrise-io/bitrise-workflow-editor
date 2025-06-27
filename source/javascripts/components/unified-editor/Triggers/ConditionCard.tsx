import {
  Button,
  Card,
  ControlButton,
  Icon,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  ToggleButton,
  Toggletip,
  Tr,
} from '@bitrise/bitkit';
import { Checkbox, Tfoot } from '@chakra-ui/react';
import { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { TargetBasedTrigger, TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';

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
    <Card variant="outline" overflow="hidden">
      <Table borderRadius="8" variant="borderless" disableRowHover isFixed>
        <Thead backgroundColor="background/primary">
          <Tr>
            <Th width="30%">Condition</Th>
            <Th>Value</Th>
            {!isTagCondition && <Th width="52px" />}
          </Tr>
        </Thead>
        <Tbody>
          {fields.map((fieldItem, index) => {
            const cond = conditions[index] || {};
            const { isLastCommitOnly, isRegex, type } = cond;
            const isRequired =
              type !== 'push_branch' &&
              type !== 'branch' &&
              type !== 'pull_request_target_branch' &&
              type !== 'pull_request_source_branch' &&
              type !== 'target_branch' &&
              type !== 'source_branch' &&
              type !== 'name' &&
              type !== 'tag';

            return (
              <Tr key={fieldItem.uniqueId}>
                <Td height="auto" paddingBlock="12" verticalAlign="top">
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
                    <Checkbox
                      marginBlockStart="12"
                      isChecked={isLastCommitOnly}
                      onChange={(e) => setValue(`conditions.${index}.isLastCommitOnly`, e.target.checked)}
                    >
                      Last commit only
                      <Toggletip label="When checked, only the latest commit message is evaluated. When unchecked, all commits in a push are evaluated.">
                        <Icon name="Info" size="16" marginLeft="5" />
                      </Toggletip>
                    </Checkbox>
                  )}
                </Td>
                <Td height="auto" paddingBlock="12" verticalAlign="top">
                  <Controller
                    name={`conditions.${index}.value`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired={isRequired}
                        onChange={(e) => field.onChange(e.target.value.trimStart())}
                        placeholder={isRegex ? '.*' : '*'}
                        helperText={type ? CONDITION_HELPERTEXT_MAP[type] || '' : ''}
                        size="md"
                        leftAddon={
                          <ToggleButton
                            aria-label="Use regex pattern. Bitrise uses Ruby's Regexp#match method."
                            iconName="Regex"
                            isSelected={isRegex}
                            marginBlockStart="4"
                            marginInlineStart="4"
                            onClick={() => {
                              setValue(`conditions.${index}.isRegex`, !isRegex);
                            }}
                          />
                        }
                        leftAddonPlacement="inside"
                      />
                    )}
                  />
                </Td>
                {!isTagCondition && (
                  <Td height="auto" paddingBlock="12" verticalAlign="top" paddingLeft="0">
                    <ControlButton
                      iconName="Trash"
                      aria-label="Remove"
                      isTooltipDisabled={fields.length === 1}
                      size="md"
                      isDanger
                      isDisabled={fields.length === 1}
                      onClick={() => remove(index)}
                    />
                  </Td>
                )}
              </Tr>
            );
          })}
        </Tbody>
        {!isTagCondition && (
          <Tfoot>
            <Tr>
              <Td>
                <Button
                  variant="tertiary"
                  size="md"
                  leftIconName="Plus"
                  onClick={append}
                  isDisabled={fields.length >= Object.keys(optionsMap).length}
                >
                  Add condition
                </Button>
              </Td>
              <Td />
              <Td />
            </Tr>
          </Tfoot>
        )}
      </Table>
    </Card>
  );
};

export default ConditionCard;

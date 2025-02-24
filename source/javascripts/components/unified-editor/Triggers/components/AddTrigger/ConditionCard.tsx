import { useMemo } from 'react';
import { useFormContext, Controller, FieldArrayWithId } from 'react-hook-form';
import {
  Button,
  Card,
  Checkbox,
  ControlButton,
  Icon,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Toggletip,
  Tr,
} from '@bitrise/bitkit';
import { Tfoot } from '@chakra-ui/react';
import { Condition, FormItems } from '../../Triggers.types';

type ConditionCardProps = {
  fields: FieldArrayWithId<FormItems, 'conditions', 'id'>[];
  append?: () => void;
  optionsMap: Record<string, string>;
  remove: (index: number) => void;
  labelsMap: Record<string, string>;
};

const CONDITION_HELPERTEXT_MAP: Record<string, string> = {
  target_branch: 'If you leave it blank, Bitrise will start builds for any target branch.',
  pull_request_target_branch: 'If you leave it blank, Bitrise will start builds for any target branch.',
  source_branch: 'If you leave it blank, Bitrise will start builds for any source branch.',
  pull_request_source_branch: 'If you leave it blank, Bitrise will start builds for any source branch.',
  name: 'If you leave it blank, Bitrise will start builds for any tag.',
};

const ConditionCard = (props: ConditionCardProps) => {
  const { fields, append, optionsMap, remove } = props;
  const { control, watch, setValue } = useFormContext();
  const { conditions } = watch();

  const showConditionsAndValue = useMemo(() => {
    return conditions.some((condition: Condition) => condition.type !== 'name');
  }, [conditions]);

  return (
    <Card variant="outline" overflow="hidden">
      <Table borderRadius="8" variant="borderless">
        {showConditionsAndValue && (
          <Thead backgroundColor="background/primary">
            <Tr>
              <Th>Condition</Th>
              <Th>Value</Th>
              <Th />
            </Tr>
          </Thead>
        )}
        <Tbody>
          {fields.map((fieldItem, index) => {
            const cond = conditions[index] || {};
            const { isRegex, type } = cond;

            return (
              <Tr key={fieldItem.id}>
                {showConditionsAndValue && (
                  <Td position="relative">
                    <Controller
                      name={`conditions.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          placeholder="Select a condition type"
                          size="md"
                          position="absolute"
                          top="12"
                          width="calc(100% - 24px)"
                          {...field}
                        >
                          {Object.entries(optionsMap).map(([optionType, text]) => {
                            const isConditionTypeUsed = conditions.some(
                              (condition: Condition) => condition.type === optionType,
                            );
                            const isTypeOfCurrentCard = optionType === conditions[index].type;

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
                  </Td>
                )}
                <Td>
                  <Controller
                    name={`conditions.${index}.value`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired={type !== 'target_branch' && type !== 'source_branch'}
                        onChange={(e) => field.onChange(e.target.value.trimStart())}
                        placeholder={isRegex ? '.*' : '*'}
                        label={showConditionsAndValue ? '' : 'Tag'}
                        helperText={CONDITION_HELPERTEXT_MAP[type] || ''}
                        size="md"
                        mt={4}
                      />
                    )}
                  />
                  <Checkbox
                    mt={8}
                    mb={4}
                    isChecked={isRegex}
                    onChange={(e) => setValue(`conditions.${index}.isRegex`, e.target.checked)}
                  >
                    Use regex pattern
                    <Toggletip
                      label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text. Bitrise uses Ruby's Regexp#match method."
                      learnMoreUrl="https://docs.ruby-lang.org/en/3.2/Regexp.html#class-Regexp-label-Regexp-23match+Method"
                    >
                      <Icon name="Info" size="16" marginLeft="5" />
                    </Toggletip>
                  </Checkbox>
                </Td>
                <Td display="flex" justifyContent="center" alignItems="center">
                  <ControlButton
                    iconName="Trash"
                    aria-label="Remove value"
                    size="sm"
                    isDanger
                    isDisabled={fields.length === 1}
                    onClick={() => remove(index)}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
        <Tfoot>
          <Tr>
            <Td>
              <Button
                variant="tertiary"
                size="md"
                leftIconName="PlusCircle"
                onClick={append}
                isDisabled={fields.length >= Object.keys(optionsMap).length}
              >
                Add condition
              </Button>
            </Td>
            <Td />
            {showConditionsAndValue && <Td />}
          </Tr>
        </Tfoot>
      </Table>
    </Card>
  );
};

export default ConditionCard;

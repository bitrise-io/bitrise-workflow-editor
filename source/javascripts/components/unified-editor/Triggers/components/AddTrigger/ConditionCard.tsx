import { ReactNode } from 'react';
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
  Td,
  Text,
  Th,
  Thead,
  Toggletip,
  Tr,
} from '@bitrise/bitkit';
import { Tbody, Tfoot } from '@chakra-ui/react';
import { Condition, FormItems } from '../../Triggers.types';

type ConditionCardProps = {
  children: ReactNode;
  conditionNumber: number;
  fields: FieldArrayWithId<FormItems, 'conditions', 'id'>[];
  onAppend?: () => void;
  optionsMap: Record<string, string>;
  labelsMap: Record<string, string>;
};

const ConditionCard = (props: ConditionCardProps) => {
  const { conditionNumber, fields, onAppend, optionsMap } = props;
  const { control, watch, setValue } = useFormContext();
  const { conditions } = watch();
  const { isRegex, type } = conditions[conditionNumber] || {};

  // TODO: investigate why blank target and source branch text not shown on the UI
  // children

  return (
    <Card variant="outline" overflow="hidden">
      <Table borderRadius="8" variant="borderless">
        <Thead backgroundColor="background/primary">
          <Tr>
            <Th>Condition</Th>
            <Th>Value</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td position="relative">
              {!!type && (
                <Controller
                  name={`conditions.${conditionNumber}.type`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Select a condition type"
                      size="md"
                      position="absolute"
                      top="12"
                      width="calc(100% - 32px)"
                      {...field}
                    >
                      {Object.entries(optionsMap).map(([optionType, text]) => {
                        const isConditionTypeUsed = conditions.some(
                          (condition: Condition) => condition.type === optionType,
                        );
                        const isTypeOfCurrentCard = optionType === conditions[conditionNumber].type;

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
              )}
            </Td>
            {!!type && (
              <Td>
                <Controller
                  name={`conditions.${conditionNumber}.value`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired={type !== 'target_branch' && type !== 'source_branch' && type !== 'name'}
                      onChange={(e) => field.onChange(e.target.value.trimStart())}
                      placeholder={isRegex ? '.*' : '*'}
                      size="md"
                      mt={4}
                    />
                  )}
                />
                {type === 'pull_request_target_branch' && (
                  <Text color="sys/neutral/base" textStyle="body/sm/regular" mt={4}>
                    If you leave it blank, Bitrise will start builds for any target branch.
                  </Text>
                )}
                {type === 'pull_request_source_branch' && (
                  <Text color="sys/neutral/base" textStyle="body/sm/regular" mt={4}>
                    If you leave it blank, Bitrise will start builds for any source branch.
                  </Text>
                )}
                <Checkbox
                  mt={8}
                  mb={4}
                  isChecked={isRegex}
                  onChange={(e) => setValue(`conditions.${conditionNumber}.isRegex`, e.target.checked)}
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
            )}
            <Td position="relative">
              <ControlButton
                iconName="Trash"
                aria-label="Remove value"
                size="sm"
                isDanger
                position="absolute"
                top="16"
              />
            </Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Td>
              <Button
                variant="tertiary"
                size="md"
                leftIconName="PlusCircle"
                onClick={onAppend}
                isDisabled={fields.length >= Object.keys(optionsMap).length}
              >
                Add condition
              </Button>
            </Td>
            <Td />
            <Td />
          </Tr>
        </Tfoot>
      </Table>
    </Card>
  );
};

export default ConditionCard;

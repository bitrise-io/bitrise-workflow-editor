import { ReactNode } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Box, Card, Checkbox, Icon, Input, Select, Text, Toggletip } from '@bitrise/bitkit';
import { Condition } from '../../Triggers.types';

type ConditionCardProps = {
  children: ReactNode;
  conditionNumber: number;
  optionsMap: Record<string, string>;
  labelsMap: Record<string, string>;
};

const ConditionCard = (props: ConditionCardProps) => {
  const { children, conditionNumber, labelsMap, optionsMap } = props;
  const { control, watch, setValue } = useFormContext();
  const { conditions } = watch();
  const { isRegex, type } = conditions[conditionNumber] || {};

  const labelText = isRegex ? 'Enter a regex pattern' : labelsMap[type];

  return (
    <Card key={conditionNumber} variant="outline" marginBottom="16" padding="16px 16px 24px 16px">
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="12">
        <Text textStyle="heading/h5">Condition {conditionNumber + 1}</Text>
        {children}
      </Box>
      <Controller
        name={`conditions.${conditionNumber}.type`}
        control={control}
        render={({ field }) => (
          <Select marginBottom="16" placeholder="Select a condition type" {...field}>
            {Object.entries(optionsMap).map(([optionType, text]) => {
              const isConditionTypeUsed = conditions.some((condition: Condition) => condition.type === optionType);
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
      {!!type && (
        <>
          <Checkbox
            marginBottom="16"
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
          <Controller
            name={`conditions.${conditionNumber}.value`}
            render={({ field }) => (
              <Input
                {...field}
                isRequired={type !== 'target_branch' && type !== 'source_branch' && type !== 'name'}
                onChange={(e) => field.onChange(e.target.value.trimStart())}
                label={labelText}
                placeholder={isRegex ? '.*' : '*'}
                marginBottom="4"
              />
            )}
          />
          {type === 'pull_request_target_branch' && (
            <Text color="sys/neutral/base" textStyle="body/sm/regular">
              If you leave it blank, Bitrise will start builds for any target branch.
            </Text>
          )}
          {type === 'pull_request_source_branch' && (
            <Text color="sys/neutral/base" textStyle="body/sm/regular">
              If you leave it blank, Bitrise will start builds for any source branch.
            </Text>
          )}
        </>
      )}
    </Card>
  );
};

export default ConditionCard;

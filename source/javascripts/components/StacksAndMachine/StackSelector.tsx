import { Box, Checkbox, Icon, Link, Select, Text, Toggletip } from '@bitrise/bitkit';

import { StackOption } from '@/core/models/Stack';
import { StackWithValue } from '@/core/services/StackAndMachineService';

const StackHelperText = ({ description, descriptionUrl }: { description?: string; descriptionUrl?: string }) => {
  return (
    <>
      {description && (
        <Text as="span" display="block">
          {description}
        </Text>
      )}
      <Text as="span" display="block">
        {descriptionUrl && (
          <Link colorScheme="purple" href={descriptionUrl} isExternal>
            Pre-installed tools
          </Link>
        )}
        {descriptionUrl && ' • '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/infrastructure/build-stacks/stack-update-policy.html"
          isExternal
        >
          Stack Update Policy
        </Link>
      </Text>
    </>
  );
};

const PreviousStackVersionTip = () => (
  <Toggletip
    label="Enable this rollback option if your builds are failing after a Stack Update. Available for 2-3 days after a Stack Update. Once the Stack has been removed, your build will run on the latest Stable Stack."
    learnMoreUrl="https://devcenter.bitrise.io/en/infrastructure/build-stacks/stack-update-policy.html#using-the-previous-version-of-a-stack"
  >
    <Icon size="16" name="QuestionCircle" color="icon/tertiary" />
  </Toggletip>
);

type Props = {
  isLoading: boolean;
  isInvalid: boolean;
  isRollbackVersionAvailable: boolean;
  useRollbackVersion?: boolean;
  stack: StackWithValue;
  options: StackOption[];
  onChange: (stackId: string, useRollbackVersion?: boolean) => void;
};

const StackSelector = ({
  isLoading,
  isInvalid,
  isRollbackVersionAvailable,
  useRollbackVersion,
  stack,
  options,
  onChange,
}: Props) => {
  return (
    <Box flex="1">
      <Select
        isRequired
        label="Stack"
        isLoading={isLoading}
        value={stack.value}
        errorText={isInvalid ? 'Invalid stack' : undefined}
        helperText={<StackHelperText description={stack.description} descriptionUrl={stack.descriptionUrl} />}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Checkbox
        isDisabled={!isRollbackVersionAvailable}
        isChecked={isRollbackVersionAvailable && useRollbackVersion}
        onChange={(e) => onChange(stack.value, e.target.checked)}
        mt="16"
      >
        Use previous stack version <PreviousStackVersionTip />
      </Checkbox>
    </Box>
  );
};

export default StackSelector;

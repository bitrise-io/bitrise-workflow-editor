import { Box, Checkbox, Icon, Link, Select, Text, Tooltip } from '@bitrise/bitkit';

import { StackOption } from '@/core/models/StackAndMachine';
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
  <Tooltip label="Enable this option if your builds are failing after a Stack Update. Your builds will start slower while using rollback stack versions.">
    <Icon size="16" name="QuestionCircle" color="icon/tertiary" />
  </Tooltip>
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
        errorText={isInvalid ? 'Invalid stack config. Select a valid stack from the list.' : undefined}
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

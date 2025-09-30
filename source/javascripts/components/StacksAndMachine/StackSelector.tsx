import { Box, Checkbox, Dropdown, DropdownGroup, DropdownOption, Icon, Link, Text, Tooltip } from '@bitrise/bitkit';

import { StackOptionGroup } from '@/core/models/StackAndMachine';
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
  optionGroups: StackOptionGroup[];
  onChange: (stackId: string, useRollbackVersion?: boolean) => void;
};

const StackSelector = ({
  isLoading,
  isInvalid,
  isRollbackVersionAvailable,
  useRollbackVersion,
  stack,
  optionGroups,
  onChange,
}: Props) => {
  return (
    <Box flex="1">
      <Dropdown
        required
        search={false}
        label="Stack"
        dropdownMaxHeight="25rem"
        disabled={isLoading}
        helperText={<StackHelperText description={stack.description} descriptionUrl={stack.descriptionUrl} />}
        errorText={isInvalid ? 'Invalid stack config. Select a valid stack from the list.' : undefined}
        value={stack.value}
        onChange={(e) => onChange(e.target.value ?? '')}
      >
        {optionGroups.length === 1 &&
          optionGroups[0].options.map(({ value, label }) => (
            <DropdownOption key={value} value={value}>
              {label}
            </DropdownOption>
          ))}
        {optionGroups.length > 1 &&
          optionGroups.map((group) => (
            <DropdownGroup key={group.label} label={group.label} labelProps={{ whiteSpace: 'nowrap' }}>
              {group.options.map(({ value, label }) => (
                <DropdownOption key={value} value={value}>
                  {label}
                </DropdownOption>
              ))}
            </DropdownGroup>
          ))}
      </Dropdown>
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

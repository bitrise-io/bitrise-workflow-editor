import {
  Avatar,
  Box,
  Checkbox,
  Dropdown,
  DropdownDetailedOption,
  DropdownGroup,
  Icon,
  Link,
  Text,
  Tooltip,
  TypeIconName,
} from '@bitrise/bitkit';

import { StackOption, StackOptionGroup } from '@/core/models/StackAndMachine';
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
          href="https://docs.bitrise.io/en/bitrise-platform/infrastructure/build-stacks/stack-update-policy.html"
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

const getIconName = (osId?: string): TypeIconName | undefined => {
  switch (osId) {
    case 'linux':
      return 'Ubuntu';
    case 'osx':
    case 'macos':
      return 'Xcode';
    default:
      return 'Stack';
  }
};

const renderOptions = (stacks: StackOption[]) => {
  return stacks.map((stack) => {
    const iconName = getIconName(stack.os);
    return (
      <DropdownDetailedOption
        key={stack.value}
        value={stack.value}
        title={stack.label}
        subtitle=""
        icon={iconName && <Avatar variant="brand" size="24" iconName={iconName} />}
      />
    );
  });
};

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
        isError={isInvalid}
        errorText={isInvalid ? 'Invalid stack config. Select a valid stack from the list.' : undefined}
        helperText={<StackHelperText description={stack.description} descriptionUrl={stack.descriptionUrl} />}
        value={stack.value}
        onChange={(e) => onChange(e.target.value ?? '')}
      >
        {optionGroups.length === 1 && renderOptions(optionGroups[0].options)}
        {optionGroups.length > 1 &&
          optionGroups.map((group) => (
            <DropdownGroup key={group.label} label={group.label} labelProps={{ whiteSpace: 'nowrap' }}>
              {renderOptions(group.options)}
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

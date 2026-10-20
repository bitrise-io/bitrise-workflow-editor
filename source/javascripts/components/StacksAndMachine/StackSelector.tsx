import { Checkbox, Dropdown, DropdownDetailedOption, DropdownGroup, Icon, Tooltip } from '@bitrise/bitkit';
import { BitkitAvatar, BitkitIconComponent, BitkitLink, IconStack, IconUbuntu, IconXcode } from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

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
          <BitkitLink colorVariant="purple" href={descriptionUrl} isExternal>
            Pre-installed tools
          </BitkitLink>
        )}
        {descriptionUrl && ' • '}
        <BitkitLink
          colorVariant="purple"
          href="https://docs.bitrise.io/en/bitrise-platform/infrastructure/build-stacks/stack-update-policy.html"
          isExternal
        >
          Stack Update Policy
        </BitkitLink>
      </Text>
    </>
  );
};

const PreviousStackVersionTip = () => (
  <Tooltip label="Enable this option if your builds are failing after a Stack Update. Your builds will start slower while using rollback stack versions.">
    <Icon size="16" name="QuestionCircle" color="icon/tertiary" />
  </Tooltip>
);

const getIcon = (osId?: string): BitkitIconComponent => {
  switch (osId) {
    case 'linux':
      return IconUbuntu;
    case 'osx':
    case 'macos':
      return IconXcode;
    default:
      return IconStack;
  }
};

const renderOptions = (stacks: StackOption[]) => {
  return stacks.map((stack) => {
    const icon = getIcon(stack.os);
    return (
      <DropdownDetailedOption
        key={stack.value}
        value={stack.value}
        title={stack.label}
        subtitle=""
        icon={<BitkitAvatar variant="icon" icon={icon} />}
      />
    );
  });
};

type Props = Pick<BoxProps, 'width'> & {
  isLoading: boolean;
  isInvalid: boolean;
  isDisabled?: boolean;
  isRollbackVersionAvailable: boolean;
  disableRollbackOption?: boolean;
  useRollbackVersion?: boolean;
  stack: StackWithValue;
  optionGroups: StackOptionGroup[];
  onChange: (stackId: string, useRollbackVersion?: boolean) => void;
};

const StackSelector = ({
  isLoading,
  isInvalid,
  isDisabled,
  isRollbackVersionAvailable,
  disableRollbackOption,
  useRollbackVersion,
  stack,
  optionGroups,
  onChange,
  ...boxProps
}: Props) => {
  const isRollbackDisabled = !isRollbackVersionAvailable || !!disableRollbackOption;

  return (
    <Box {...boxProps} flex="1">
      <Dropdown
        required
        search={false}
        label="Stack"
        dropdownMaxHeight="25rem"
        disabled={isLoading || isDisabled}
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
      <Tooltip
        label="Stack rollback is not available when your workspace is configured to use external hosts only."
        isDisabled={!disableRollbackOption}
      >
        <Box display="inline-block" marginBlockStart="16">
          <Checkbox
            isDisabled={isRollbackDisabled || isDisabled}
            isChecked={!isRollbackDisabled && useRollbackVersion}
            onChange={(e) => onChange(stack.value, e.target.checked)}
          >
            Use previous stack version <PreviousStackVersionTip />
          </Checkbox>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default StackSelector;

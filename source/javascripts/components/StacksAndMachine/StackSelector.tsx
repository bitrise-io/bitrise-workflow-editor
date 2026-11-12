import {
  BitkitCheckbox,
  BitkitIconComponent,
  BitkitLink,
  BitkitSelect,
  BitkitTooltip,
  IconQuestionCircle,
  IconStack,
  IconUbuntu,
  IconXcode,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

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

const PreviousStackVersionTip = ({ disabled }: { disabled: boolean }) => (
  <BitkitTooltip
    disabled={disabled}
    text="Enable this option if your builds are failing after a Stack Update. Your builds will start slower while using rollback stack versions."
  >
    <IconQuestionCircle size="16" color="icon/tertiary" />
  </BitkitTooltip>
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

const toItems = (optionGroups: StackOptionGroup[]) =>
  optionGroups.flatMap((group) =>
    group.options.map((stack) => ({
      group: optionGroups.length > 1 ? group.label : undefined,
      icon: getIcon(stack.os),
      label: stack.label,
      value: stack.value,
    })),
  );

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
      <BitkitSelect
        errorText={isInvalid ? 'Invalid stack config. Select a valid stack from the list.' : undefined}
        helperText={<StackHelperText description={stack.description} descriptionUrl={stack.descriptionUrl} />}
        items={toItems(optionGroups)}
        label="Stack"
        state={isLoading || isDisabled ? 'disabled' : undefined}
        value={stack.value}
        onValueChange={(value) => onChange(value ?? '')}
      />
      {/* The "?" tooltip sits inside the rollback one. Only one tooltip opens at a time, and the pointer
          reaches every enclosing trigger, so only one of the two is enabled. */}
      <BitkitTooltip
        disabled={!disableRollbackOption}
        text="Stack rollback is not available when your workspace is configured to use external hosts only."
      >
        <Box display="inline-block" marginBlockStart="16">
          <BitkitCheckbox
            labelText={
              <>
                Use previous stack version <PreviousStackVersionTip disabled={!!disableRollbackOption} />
              </>
            }
            state={isRollbackDisabled || isDisabled ? 'disabled' : undefined}
            checked={!isRollbackDisabled && !!useRollbackVersion}
            onCheckedChange={({ checked }) => onChange(stack.value, checked === true)}
          />
        </Box>
      </BitkitTooltip>
    </Box>
  );
};

export default StackSelector;

import { Card, ExpandableCard } from '@bitrise/bitkit';
import { BitkitBadge } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { ReactNode } from 'react';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
  isDefault?: boolean;
};

const ButtonContent = ({ stackName, machineTypeName, isDefault }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" minWidth="0">
      <Box display="flex" flexDirection="column" alignItems="flex-start" minWidth="0">
        <Text textStyle="body/lg/semibold">Stack & Machine</Text>
        <Text textStyle="body/md/regular" color="text/secondary" truncate maxWidth="full">
          {[stackName, machineTypeName].filter(Boolean).join(' • ')}
        </Text>
      </Box>
      {isDefault && (
        <BitkitBadge colorVariant="blue" marginInlineEnd="16">
          Default
        </BitkitBadge>
      )}
    </Box>
  );
};

type StackAndMachineWrapperProps = {
  children: ReactNode;
  isDefault?: boolean;
  isExpandable?: boolean;
  machineTypeName?: string;
  stackName?: string;
};

const StackAndMachineWrapper = (props: StackAndMachineWrapperProps) => {
  const { children, isDefault, isExpandable, machineTypeName, stackName } = props;
  if (isExpandable) {
    return (
      <ExpandableCard
        buttonContent={<ButtonContent isDefault={isDefault} stackName={stackName} machineTypeName={machineTypeName} />}
        buttonPadding="16px 24px"
        padding="24"
      >
        {children}
      </ExpandableCard>
    );
  }
  return <Card padding="16">{children}</Card>;
};

export default StackAndMachineWrapper;

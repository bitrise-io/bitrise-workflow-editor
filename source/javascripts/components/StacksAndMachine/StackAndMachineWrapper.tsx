import { Badge, Box, Card, ExpandableCard, Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

type ButtonContentProps = {
  stackName?: string;
  machineTypeName?: string;
  isDefault?: boolean;
};

const ButtonContent = ({ stackName, machineTypeName, isDefault }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" minW={0}>
      <Box display="flex" flexDir="column" alignItems="flex-start" minW={0}>
        <Text textStyle="body/lg/semibold">Stack & Machine</Text>
        <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
          {[stackName, machineTypeName].filter(Boolean).join(' • ')}
        </Text>
      </Box>
      {isDefault && (
        <Badge variant="subtle" colorScheme="info" mr="16">
          Default
        </Badge>
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

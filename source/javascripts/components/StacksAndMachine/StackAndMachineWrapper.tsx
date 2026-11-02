import { Card } from '@bitrise/bitkit';
import { BitkitBadge, BitkitExpandableCard } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { ReactNode } from 'react';

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
    const subtitle = [stackName, machineTypeName].filter(Boolean).join(' • ');

    return (
      <BitkitExpandableCard
        elevation={false}
        subtitle={
          subtitle ? (
            <Text as="span" display="block" truncate>
              {subtitle}
            </Text>
          ) : undefined
        }
        suffix={isDefault ? <BitkitBadge colorVariant="blue">Default</BitkitBadge> : undefined}
        title="Stack & Machine"
      >
        {children}
      </BitkitExpandableCard>
    );
  }
  return <Card padding="16">{children}</Card>;
};

export default StackAndMachineWrapper;

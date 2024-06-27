import { Box, Card, CardProps, Icon, Image, Text } from '@bitrise/bitkit';

import defaultStepIcon from '../../../../images/step/icon-default.svg';
import StepBadge from '../../StepBadge/StepBadge';
import { Step } from '../StepDrawer.types';

type Props = Step & {
  cardProps?: CardProps;
  onClick: () => void;
};

const DrawerStepCard = ({
  icon,
  title,
  description,
  version,
  isOfficial,
  isVerified,
  isDeprecated,
  onClick,
  cardProps,
}: Props) => {
  return (
    <Card
      as="button"
      variant="outline"
      position="relative"
      textAlign="left"
      padding="12"
      {...cardProps}
      className="group"
      onClick={onClick}
      _hover={{
        backgroundColor: 'inherit',
        borderColor: 'border.strong',
        boxShadow: 'small',
      }}
    >
      <Box display="flex" gap="8" mb="8">
        <Box position="relative" minW="40px" minH="40px">
          <Image
            height="40px"
            width="40px"
            src={icon}
            alt={title}
            fallbackSrc={defaultStepIcon}
            borderRadius="4px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="neutral.90"
            loading="lazy"
          />
          <StepBadge
            position="absolute"
            top="21px"
            left="21px"
            isOfficial={isOfficial}
            isVerified={isVerified}
            isDeprecated={isDeprecated}
          />
        </Box>
        <Box overflow="hidden" marginRight="32">
          <Text textStyle="body/lg/semibold" hasEllipsis>
            {title}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" noOfLines={2} color="text/secondary">
        {description}
      </Text>
      <Icon
        position="absolute"
        top={12}
        right={12}
        name="PlusAdd"
        color="icon/interactive"
        display="none"
        _groupHover={{ display: 'block' }}
      />
    </Card>
  );
};

export default DrawerStepCard;

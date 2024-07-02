import { useCallback } from 'react';
import { Box, Card, CardProps, Icon, Image, Text } from '@bitrise/bitkit';

import { ColorProps } from '@chakra-ui/react';
import defaultStepIcon from '../../../../images/step/icon-default.svg';
import StepBadge from '../../StepBadge/StepBadge';
import { Step } from '../StepDrawer.types';

const HoverStyles = {
  backgroundColor: 'inherit',
  borderColor: 'border.strong',
  boxShadow: 'small',
};

type Props = Step & {
  cardProps?: CardProps;
  isDisabled?: boolean;
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
  isDisabled,
  onClick,
  cardProps,
}: Props) => {
  const getColor = useCallback((color: ColorProps['color']) => (isDisabled ? 'text/disabled' : color), [isDisabled]);

  return (
    <Card
      as="button"
      className="group"
      variant="outline"
      position="relative"
      textAlign="left"
      padding="12"
      _hover={!isDisabled ? HoverStyles : 'unset'}
      disabled={isDisabled}
      {...cardProps}
      onClick={onClick}
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
            opacity={isDisabled ? 0.5 : 1}
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
          <Text textStyle="body/lg/semibold" hasEllipsis color={getColor('inherit')}>
            {title}
          </Text>
          <Text textStyle="body/md/regular" color={getColor('text/secondary')}>
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" noOfLines={2} color={getColor('text/secondary')}>
        {description}
      </Text>
      {!isDisabled && (
        <Icon
          position="absolute"
          top={12}
          right={12}
          name="PlusAdd"
          color="icon/interactive"
          display="none"
          _groupHover={{ display: 'block' }}
        />
      )}
    </Card>
  );
};

export default DrawerStepCard;

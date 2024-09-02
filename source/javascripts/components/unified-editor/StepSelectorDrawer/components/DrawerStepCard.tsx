import { useCallback, useMemo, useRef } from 'react';
import { Box, Card, CardProps, Icon, Image, Text, Tooltip } from '@bitrise/bitkit';
import { ColorProps } from '@chakra-ui/react';

import StepBadge from '@/components/StepBadge';
import defaultStepIcon from '@/../images/step/icon-default.svg';
import useIsTruncated from '@/hooks/useIsTruncated';

const HoverStyles = {
  backgroundColor: 'inherit',
  borderColor: 'border.strong',
  boxShadow: 'small',
};

type Props = {
  cardProps?: CardProps;
  icon: string;
  title: string;
  summary?: string;
  description?: string;
  version?: string;
  isOfficial?: boolean;
  isVerified?: boolean;
  isDeprecated?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
};

const DrawerStepCard = ({
  icon,
  title,
  summary,
  description,
  version,
  isOfficial,
  isVerified,
  isDeprecated,
  isDisabled,
  onClick,
  cardProps,
}: Props) => {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const isTitleTruncated = useIsTruncated(titleRef);
  const getColor = useCallback((color: ColorProps['color']) => (isDisabled ? 'text/disabled' : color), [isDisabled]);
  const detail = useMemo(() => summary || description?.split('\n')[0], [summary, description]);

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
          <Tooltip label={title} aria-label={title} isDisabled={!isTitleTruncated}>
            <Text ref={titleRef} textStyle="body/lg/semibold" hasEllipsis color={getColor('inherit')}>
              {title}
            </Text>
          </Tooltip>
          <Text textStyle="body/md/regular" color={getColor('text/secondary')}>
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" noOfLines={2} color={getColor('text/secondary')}>
        {detail}
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

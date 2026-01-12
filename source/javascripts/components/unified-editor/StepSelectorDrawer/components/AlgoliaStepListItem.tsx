import { Avatar, Box, Card, CardProps, Icon, LinkButton, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { MouseEventHandler, useRef } from 'react';
import removeMd from 'remove-markdown';

import StepBadge from '@/components/StepBadge';
import { Maintainer } from '@/core/models/Step';
import useIsTruncated from '@/hooks/useIsTruncated';

import { STEP_HEIGHT } from './AlgoliaStepList.const';

type Props = CardProps & {
  logo?: string;
  title?: string;
  version?: string;
  maintainer?: Maintainer;
  description?: string;
  isDisabled?: boolean;
};

const AlgoliaStepListItem = ({
  logo,
  title,
  version,
  maintainer,
  description,
  isDisabled,
  onClick,
  ...props
}: Props) => {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const isTitleTruncated = useIsTruncated(titleRef);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const opacity = isDisabled ? 0.3 : 1;
  const isOfficial = maintainer === Maintainer.Bitrise;
  const isVerified = maintainer === Maintainer.Verified;

  let hoverProps: Props = {};
  if (!isDisabled) {
    hoverProps = {
      className: 'group',
      _hover: {
        boxShadow: 'small',
        borderColor: 'border/strong',
      },
    };
  }

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (isDisabled) {
      return;
    }

    onClick?.(e);
  };

  const handleReadMoreClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    onOpen();
  };

  return (
    <Card
      p="8"
      gap="8"
      minW="0"
      role="button"
      display="flex"
      variant="outline"
      position="relative"
      flexDirection="column"
      {...props}
      {...hoverProps}
      opacity={opacity}
      onClick={handleClick}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      zIndex={isOpen ? 100 : 0}
      height={isOpen ? 320 : STEP_HEIGHT}
      transition="all 0.3s ease"
      onMouseLeave={() => onClose()}
    >
      <Box display="flex" gap="8">
        <Box position="relative">
          <Avatar
            as="div"
            size="40"
            src={logo}
            variant="step"
            display="flex"
            name={title || ''}
            border="1px solid var(--colors-border-minimal)"
          />
          <StepBadge position="absolute" bottom="-6px" right="-6px" isOfficial={isOfficial} isVerified={isVerified} />
        </Box>
        <Box flex="1" display="flex" flexDirection="column" minW="0">
          <Tooltip isDisabled={!isTitleTruncated} label={title} shouldWrapChildren>
            <Text ref={titleRef} textStyle="body/md/semibold" hasEllipsis>
              {title}
            </Text>
          </Tooltip>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {version}
          </Text>
        </Box>
        {!isDisabled && <Icon display="none" name="Plus" color="icon/interactive" _groupHover={{ display: 'block' }} />}
      </Box>
      <Text noOfLines={3} color="text/secondary" textStyle="body/sm/regular">
        {removeMd(description || '')}
      </Text>
      <Box
        inset="0"
        bg="white"
        top="auto"
        height="26"
        display="none"
        position="absolute"
        borderBottomRadius="8"
        _groupHover={{ display: 'block' }}
      >
        <LinkButton size="sm" px="8" pb="8" top="-2px" position="relative" onClick={handleReadMoreClick}>
          Read more
        </LinkButton>
      </Box>
    </Card>
  );
};

export default AlgoliaStepListItem;

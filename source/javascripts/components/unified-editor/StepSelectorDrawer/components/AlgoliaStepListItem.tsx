import {
  Avatar,
  Box,
  Card,
  CardProps,
  ControlButton,
  Icon,
  LinkButton,
  MarkdownContent,
  Text,
  Tooltip,
  useDisclosure,
} from '@bitrise/bitkit';
import { MouseEventHandler, useRef } from 'react';
import removeMd from 'remove-markdown';

import StepBadge from '@/components/StepBadge';
import { Maintainer } from '@/core/models/Step';
import useIsTruncated from '@/hooks/useIsTruncated';

import { STEP_HEIGHT } from './AlgoliaStepList.const';

type Props = Omit<CardProps, 'onClick'> & {
  logo?: string;
  title?: string;
  version?: string;
  maintainer?: Maintainer;
  description?: string;
  isDisabled?: boolean;
  onClick?: VoidFunction;
};

const TRANSITION = 'all 0.3s ease';

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

  let cursor = 'pointer';
  if (isDisabled) {
    cursor = 'not-allowed';
  } else if (isOpen) {
    cursor = 'auto';
  }

  const handleReadMoreClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onOpen();
  };

  return (
    <Card
      minW="0"
      role="button"
      display="flex"
      variant="outline"
      position="relative"
      flexDirection="column"
      {...props}
      {...hoverProps}
      cursor={cursor}
      overflow="hidden"
      transition={TRANSITION}
      zIndex={isOpen ? 100 : 0}
      opacity={isDisabled ? 0.3 : 1}
      height={isOpen ? 320 : STEP_HEIGHT}
      onClick={!isDisabled && !isOpen ? onClick : undefined}
      onMouseLeave={onClose}
    >
      <Box
        display="flex"
        gap="8"
        px="12"
        py={isOpen ? '8' : '12'}
        transition={TRANSITION}
        transitionProperty="padding"
        borderBottom={isOpen ? '1px solid var(--colors-border-regular)' : 'none'}
      >
        <Box position="relative">
          <Avatar
            src={logo}
            variant="step"
            display="flex"
            name={title || ''}
            transition={TRANSITION}
            size={isOpen ? '32' : '40'}
            border="1px solid var(--colors-border-minimal)"
          />
          <StepBadge
            position="absolute"
            transition={TRANSITION}
            size={isOpen ? '16' : '24'}
            right={isOpen ? '-4px' : '-6px'}
            bottom={isOpen ? '-8px' : '-4px'}
            isOfficial={maintainer === Maintainer.Bitrise}
            isVerified={maintainer === Maintainer.Verified}
          />
        </Box>
        <Box flex="1" display="flex" flexDirection="column" minW="0">
          <Tooltip isDisabled={!isTitleTruncated} label={title} shouldWrapChildren>
            <Text
              ref={titleRef}
              transition={TRANSITION}
              textStyle={isOpen ? 'body/md/semibold' : 'body/lg/semibold'}
              hasEllipsis
            >
              {title}
            </Text>
          </Tooltip>
          <Text
            color="text/secondary"
            transition={TRANSITION}
            mt={isOpen ? '-4px' : '0px'}
            textStyle={isOpen ? 'body/sm/regular' : 'body/md/regular'}
          >
            {version}
          </Text>
        </Box>

        {!isDisabled && !isOpen && (
          <Icon display="none" name="Plus" color="icon/interactive" _groupHover={{ display: 'block' }} />
        )}

        {!isDisabled && isOpen && <ControlButton aria-label="Add to Workflow" iconName="Plus" onClick={onClick} />}
      </Box>

      {!isOpen && (
        <Text noOfLines={isOpen ? undefined : 3} color="text/secondary" textStyle="body/sm/regular" px="12">
          {removeMd(description || '')}
        </Text>
      )}

      {isOpen && (
        <Box color="text/secondary" overflowY="auto" overflowX="clip" overscrollBehaviorY="contain" flex="1" p="12">
          <MarkdownContent md={description || ''} size="sm" />
        </Box>
      )}

      {!isDisabled && !isOpen && (
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
          <LinkButton size="sm" px="12" pb="8" top="-5px" position="relative" onClick={handleReadMoreClick}>
            Read more
          </LinkButton>
        </Box>
      )}
    </Card>
  );
};

export default AlgoliaStepListItem;

import { MarkdownContent, Tooltip } from '@bitrise/bitkit';
import { BitkitAvatar, BitkitControlButton, BitkitLinkButton, IconPlus, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card, CardRootProps } from '@chakra-ui/react/card';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Text } from '@chakra-ui/react/text';
import { MouseEventHandler, useRef } from 'react';
import removeMd from 'remove-markdown';

import defaultIcon from '@/../images/step/icon-default.svg';
import StepBadge from '@/components/StepBadge';
import { Maintainer } from '@/core/models/Step';
import useIsTruncated from '@/hooks/useIsTruncated';

import { STEP_HEIGHT } from './AlgoliaStepList.const';

type Props = Omit<CardRootProps, 'onClick'> & {
  logo?: string;
  title?: string;
  version?: string;
  maintainer?: Maintainer;
  description?: string;
  isDisabled?: boolean;
  onClick?: VoidFunction;
};

const TRANSITION = 'all 0.3s ease';
const EXPANDED_HEIGHT = 320;

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
  const { open: isOpen, onOpen, onClose } = useDisclosure();

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
    <Card.Root
      elevation={false}
      minWidth="0"
      role="button"
      display="flex"
      position="relative"
      flexDirection="column"
      {...props}
      className={isDisabled ? undefined : 'group'}
      interactive={!isDisabled}
      cursor={cursor}
      overflow="hidden"
      transition={TRANSITION}
      zIndex={isOpen ? 100 : 0}
      opacity={isDisabled ? 0.3 : 1}
      height={isOpen ? EXPANDED_HEIGHT : STEP_HEIGHT}
      onClick={!isDisabled && !isOpen ? onClick : undefined}
      onMouseLeave={onClose}
    >
      <Box
        paddingInline="12"
        gap="8"
        display="flex"
        transition={TRANSITION}
        paddingBlock={isOpen ? '8' : '12'}
        transitionProperty="padding"
        borderBottom={isOpen ? '1px solid' : 'none'}
        borderColor="border/regular"
      >
        <Box position="relative">
          <BitkitAvatar
            variant="image"
            src={logo || defaultIcon}
            name={title || ''}
            transition={TRANSITION}
            size={isOpen ? '32' : '40'}
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
        <Box flex="1" display="flex" flexDirection="column" minWidth="0">
          <Tooltip isDisabled={!isTitleTruncated} label={title} shouldWrapChildren>
            <Text
              ref={titleRef}
              transition={TRANSITION}
              textStyle={isOpen ? 'body/md/semibold' : 'body/lg/semibold'}
              truncate
              maxWidth="full"
            >
              {title}
            </Text>
          </Tooltip>
          <Text
            color="text/secondary"
            transition={TRANSITION}
            marginBlockStart={isOpen ? '-4' : '0'}
            textStyle={isOpen ? 'body/sm/regular' : 'body/md/regular'}
          >
            {version}
          </Text>
        </Box>

        {!isDisabled && !isOpen && (
          <IconPlus
            boxSize="32"
            padding="4"
            display="none"
            color="icon/interactive"
            _groupHover={{ display: 'block' }}
          />
        )}

        {!isDisabled && isOpen && <BitkitControlButton label="Add to Workflow" icon={IconPlus} onClick={onClick} />}
      </Box>

      {!isOpen && (
        <Text lineClamp="3" color="text/secondary" textStyle="body/sm/regular" paddingInline="12">
          {removeMd(description || '')}
        </Text>
      )}

      {isOpen && (
        <Box
          color="text/secondary"
          overflowY="auto"
          overflowX="clip"
          overscrollBehaviorY="contain"
          flex="1"
          padding="12"
        >
          <MarkdownContent md={description || ''} size="sm" />
        </Box>
      )}

      {!isDisabled && !isOpen && (
        <Box
          inset="0"
          background="background/secondary"
          top="auto"
          height={rem(26)}
          display="none"
          position="absolute"
          borderBottomRadius="8"
          _groupHover={{ display: 'block' }}
        >
          <BitkitLinkButton
            size="sm"
            paddingInline="12"
            paddingBlockEnd="8"
            top="-5px"
            position="relative"
            onClick={handleReadMoreClick}
          >
            Read more
          </BitkitLinkButton>
        </Box>
      )}
    </Card.Root>
  );
};

export default AlgoliaStepListItem;

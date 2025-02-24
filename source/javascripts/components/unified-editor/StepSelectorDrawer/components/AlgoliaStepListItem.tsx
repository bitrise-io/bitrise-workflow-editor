import { MouseEventHandler, useRef } from 'react';
import { Avatar, Box, Card, CardProps, Icon, Text, Tooltip } from '@bitrise/bitkit';
import removeMd from 'remove-markdown';
import { Maintainer } from '@/core/models/Step';
import StepBadge from '@/components/StepBadge';
import useIsTruncated from '@/hooks/useIsTruncated';

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

  return (
    <Card
      p="8"
      gap="8"
      minW="0"
      role="button"
      display="flex"
      variant="outline"
      flexDirection="column"
      {...props}
      {...hoverProps}
      opacity={opacity}
      onClick={handleClick}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
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
        {!isDisabled && (
          <Icon display="none" name="PlusCircle" color="icon/interactive" _groupHover={{ display: 'block' }} />
        )}
      </Box>
      <Text noOfLines={2} color="text/secondary" textStyle="body/sm/regular">
        {removeMd(description || '')}
      </Text>
    </Card>
  );
};

export default AlgoliaStepListItem;

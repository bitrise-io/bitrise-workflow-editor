import { BitkitTooltip, IconBadge3RdParty, IconBadgeBitrise } from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';

import deprecatedIcon from '@/../images/step/badge-deprecated.svg';

type StepItemBadgeProps = BoxProps & {
  size?: '16' | '24';
  isOfficial?: boolean;
  isVerified?: boolean;
  isCommunity?: boolean;
  isDeprecated?: boolean;
};

const StepBadge = ({
  size = '24',
  isOfficial,
  isVerified,
  isDeprecated,
  isCommunity: _,
  ...rest
}: StepItemBadgeProps) => {
  if (isOfficial) {
    return (
      <Box title="Bitrise step" data-e2e-tag="official-badge" {...rest}>
        <BitkitTooltip text="Maintained by Bitrise">
          <IconBadgeBitrise size={size} />
        </BitkitTooltip>
      </Box>
    );
  }

  if (isVerified) {
    return (
      <Box title="Verified step" data-e2e-tag="verified-badge" {...rest}>
        <BitkitTooltip text="Verified by Bitrise">
          <IconBadge3RdParty size={size} />
        </BitkitTooltip>
      </Box>
    );
  }

  if (isDeprecated) {
    return (
      <Box
        title="Deprecated step"
        display="flex"
        flexDirection="row"
        alignItems="center"
        data-e2e-tag="deprecated-badge"
        {...rest}
      >
        <BitkitTooltip text="Deprecated step">
          <img className="deprecated" src={deprecatedIcon} width="18" height="18" alt="Deprecated" />
        </BitkitTooltip>
      </Box>
    );
  }

  return null;
};

export default StepBadge;

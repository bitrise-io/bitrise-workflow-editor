import { Icon } from '@bitrise/bitkit';
import { Box, type BoxProps } from '@chakra-ui/react/box';

import deprecatedIcon from '@/../images/step/badge-deprecated.svg';
import LabelTooltip from '@/components/LabelTooltip';

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
        <LabelTooltip text="Maintained by Bitrise">
          <Icon name="BadgeBitrise" size={size} />
        </LabelTooltip>
      </Box>
    );
  }

  if (isVerified) {
    return (
      <Box title="Verified step" data-e2e-tag="verified-badge" {...rest}>
        <LabelTooltip text="Verified by Bitrise">
          <Icon name="Badge3rdParty" size={size} />
        </LabelTooltip>
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
        <LabelTooltip text="Deprecated step">
          <img className="deprecated" src={deprecatedIcon} width="18" height="18" alt="Deprecated" />
        </LabelTooltip>
      </Box>
    );
  }

  return null;
};

export default StepBadge;

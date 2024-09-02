import { Box, BoxProps, Icon, Tooltip } from '@bitrise/bitkit';

import deprecatedIcon from '@/../images/step/badge-deprecated.svg';

type StepItemBadgeProps = BoxProps & {
  isOfficial?: boolean;
  isVerified?: boolean;
  isCommunity?: boolean;
  isDeprecated?: boolean;
};

const StepBadge = ({ isOfficial, isVerified, isDeprecated, isCommunity, ...rest }: StepItemBadgeProps) => {
  if (isOfficial) {
    return (
      <Box title="Bitrise step" data-e2e-tag="official-badge" {...rest}>
        <Tooltip label="Maintained by Bitrise">
          <Icon name="BadgeBitrise" />
        </Tooltip>
      </Box>
    );
  }

  if (isVerified) {
    return (
      <Box title="Verified step" data-e2e-tag="verified-badge" {...rest}>
        <Tooltip label="Verified by Bitrise">
          <Icon name="Badge3rdParty" />
        </Tooltip>
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
        <Tooltip label="Deprecated step">
          <img className="deprecated" src={deprecatedIcon} width="18" height="18" alt="Deprecated" />
        </Tooltip>
      </Box>
    );
  }

  return null;
};

export default StepBadge;

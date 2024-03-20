import { Box, Icon } from "@bitrise/bitkit";

import deprecatedIcon from "../../../images/step/badge-deprecated.svg";

type StepItemBadgeProps = {
  isOfficial: boolean;
  isVerified: boolean;
  isDeprecated: boolean;
};

const StepItemBadge = ({
  isOfficial,
  isVerified,
  isDeprecated,
}: StepItemBadgeProps): JSX.Element => (
  <>
    {isOfficial && (
      <Box title="Bitrise step" paddingX="4" data-e2e-tag="official-badge">
        <Icon name="BadgeBitrise" />
      </Box>
    )}
    {isVerified && (
      <Box title="Verified step" paddingX="4" data-e2e-tag="verified-badge">
        <Icon name="Badge3rdParty" />
      </Box>
    )}
    {isDeprecated && (
      <Box
        title="Deprecated step"
        display="flex"
        flexDirection="row"
        alignItems="center"
        data-e2e-tag="deprecated-badge"
      >
        <img
          className="deprecated"
          src={deprecatedIcon}
          width="18"
          height="18"
          alt="Deprecated"
        />
      </Box>
    )}
  </>
);

export default StepItemBadge;

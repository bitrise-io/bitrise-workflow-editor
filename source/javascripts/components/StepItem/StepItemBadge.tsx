import { Fragment } from "react";
import { Box, Icon } from "@bitrise/bitkit";
import { Step } from "../../models";

import deprecatedIcon from "../../../images/step/badge-deprecated.svg";

type StepItemBadgeProps = {
	step: Step;
};

const StepItemBadge = ({ step }: StepItemBadgeProps): JSX.Element => (
	<Fragment>
		{step.isOfficial() && (
			<Box title="Bitrise step" paddingX="4" data-e2e-tag="official-badge">
				<Icon name="BadgeBitrise" />
			</Box>
		)}
		{step.isVerified() && (
			<Box title="Verified step" paddingX="4" data-e2e-tag="verified-badge">
				<Icon name="Badge3rdParty" />
			</Box>
		)}
		{step.isDeprecated() && (
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
					alt="Deprecated" />
			</Box>
		)}
	</Fragment>
);

export default StepItemBadge;

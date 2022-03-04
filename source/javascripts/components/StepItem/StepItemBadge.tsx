import React, { Fragment } from "react";
import { Base, Icon, Flex } from "@bitrise/bitkit";
import { Step } from "../../models";

import deprecatedIcon from "../../../images/step/badge-deprecated.svg";

type StepItemBadgeProps = {
	step: Step;
};

const StepItemBadge = ({ step }: StepItemBadgeProps): JSX.Element => (
	<Fragment>
		{step.isOfficial() && (
			<Base title="Bitrise step" paddingHorizontal="x1" data-e2e-tag="official-badge">
				<Icon name="BitriseCertified" textColor="aqua-3" />
			</Base>
		)}
		{step.isVerified() && (
			<Base title="Verified step" paddingHorizontal="x1" data-e2e-tag="verified-badge">
				<Icon name="StepThirdParty" textColor="blue-3" />
			</Base>
		)}
		{step.isDeprecated() && (
			<Flex
				title="Deprecated step"
				direction="horizontal"
				alignChildrenVertical="middle"
				data-e2e-tag="deprecated-badge"
			>
				<img
					className="deprecated"
					src={deprecatedIcon}
					width="18"
					height="18"
					alt="Deprecated" />
			</Flex>
		)}
	</Fragment>
);

export default StepItemBadge;

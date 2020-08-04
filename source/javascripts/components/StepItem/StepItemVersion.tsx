import React from "react";
import { Text, Badge, Icon } from "@bitrise/bitkit";
import { Step } from "../../models";

type StepItemVersionProps = {
	version: string;
	step: Step;
	highlightVersionUpdate: boolean;
	strings: {
		alwaysLatest: string;
	};
};

const StepItemVersion = ({ version, step, highlightVersionUpdate, strings }: StepItemVersionProps): JSX.Element => (
	<em className="version" data-e2e-tag="step-item__version">
		{version && highlightVersionUpdate && (
			<Badge backgroundColor="red-3" textColor="white" data-e2e-tag="step-item__update-indicator">
				<Icon name="ArrowUp" />
				{step.version}
			</Badge>
		)}
		{version && !highlightVersionUpdate && <Text>{step.version}</Text>}
		{!version && <Text>{strings.alwaysLatest}</Text>}
	</em>
);

export default StepItemVersion;

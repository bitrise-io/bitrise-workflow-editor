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
			<Badge className="Badge" padding="0 0.18rem" lineHeight="1.125rem" backgroundColor="red.60" textColor="neutral.100" data-e2e-tag="step-item__update-indicator">
				<Icon className="Icon" name="ArrowUp" />
				{step.version}
			</Badge>
		)}
		{version && !highlightVersionUpdate && <Text>{step.version}</Text>}
		{!version && <Text>{strings.alwaysLatest}</Text>}
	</em>
);

export default StepItemVersion;

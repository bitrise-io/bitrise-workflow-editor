import { Badge, Icon, Text } from "@bitrise/bitkit";

type StepItemVersionProps = {
	requestedVersion: string;
	actualVersion: string;
	hasVersionUpdate: boolean;
};

const StepItemVersion = ({ actualVersion, requestedVersion, hasVersionUpdate }: StepItemVersionProps): JSX.Element => (
	<em className="version" data-e2e-tag="step-item__version">
		{requestedVersion && hasVersionUpdate && (
			<Badge
				className="Badge"
				padding="0 0.18rem"
				lineHeight="1.125rem"
				backgroundColor="red.60"
				textColor="neutral.100"
				data-e2e-tag="step-item__update-indicator"
			>
				<Icon className="Icon" name="ArrowUp" />
				{actualVersion}
			</Badge>
		)}
		{requestedVersion && !hasVersionUpdate && <Text>{actualVersion}</Text>}
		{!requestedVersion && <Text>Always latest</Text>}
	</em>
);

export default StepItemVersion;

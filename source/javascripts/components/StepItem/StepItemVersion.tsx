import { Badge, Text } from '@bitrise/bitkit';

type StepItemVersionProps = {
  requestedVersion: string;
  actualVersion: string;
  hasVersionUpdate: boolean;
};

const StepItemVersion = ({ actualVersion, requestedVersion, hasVersionUpdate }: StepItemVersionProps): JSX.Element => (
  <em className="version" data-e2e-tag="step-item__version">
    {requestedVersion && hasVersionUpdate && (
      <Badge
        variant="bold"
        iconName="ArrowUp"
        colorScheme="negative"
        className="Badge"
        padding="0 0.18rem"
        lineHeight="1.125rem"
        data-e2e-tag="step-item__update-indicator"
      >
        {actualVersion}
      </Badge>
    )}
    {requestedVersion && !hasVersionUpdate && <Text>{actualVersion}</Text>}
    {!requestedVersion && <Text>Always latest</Text>}
  </em>
);

export default StepItemVersion;

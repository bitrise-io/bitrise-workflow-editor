import { Text } from '@bitrise/bitkit';

type Props = {
  definingPath?: string;
  sourceLabel?: string;
  pathTextStyle?: string;
};

export const crossFileProvenanceLabel = (definingPath?: string) => `Defined in ${definingPath || 'another file'}`;

const CrossFileProvenanceText = ({ definingPath, sourceLabel, pathTextStyle = 'body/sm/semibold' }: Props) => (
  <>
    Defined in{' '}
    <Text as="span" textStyle={pathTextStyle}>
      {definingPath ?? 'another file'}
    </Text>
    {sourceLabel ? ` • ${sourceLabel}` : ''}
  </>
);

export default CrossFileProvenanceText;

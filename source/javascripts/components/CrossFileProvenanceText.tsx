import { Text } from '@bitrise/bitkit';

type Props = {
  definingPath?: string;
  sourceLabel?: string;
  /** textStyle of the emphasized path segment. */
  pathTextStyle?: string;
};

/** Plain-string variant for truncating card subtitles. */
export const crossFileProvenanceLabel = (definingPath?: string) => `Defined in ${definingPath || 'another file'}`;

/**
 * Inline "Defined in `<file>` • `<source>`" provenance for a cross-file entity. Callers
 * gate on `isCrossFile` — it renders nothing meaningful for a local entity.
 */
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

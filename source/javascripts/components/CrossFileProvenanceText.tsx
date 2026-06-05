import { Text } from '@bitrise/bitkit';

type Props = {
  definingPath?: string;
  sourceLabel?: string;
};

/**
 * Inline "Defined in `<file>` • `<source>`" provenance for a cross-file entity,
 * meant to sit inside a card's secondary subtitle `<Text>`. The source label
 * (branch / tag / repo) is appended when the defining file was included with one.
 * Renders nothing meaningful for a local entity — callers gate on `isCrossFile`.
 */
const CrossFileProvenanceText = ({ definingPath, sourceLabel }: Props) => (
  <>
    Defined in{' '}
    <Text as="span" textStyle="body/sm/semibold">
      {definingPath ?? 'another file'}
    </Text>
    {sourceLabel ? ` • ${sourceLabel}` : ''}
  </>
);

export default CrossFileProvenanceText;

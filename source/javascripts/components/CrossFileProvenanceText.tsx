import { Text } from '@bitrise/bitkit';

type Props = {
  definingPath?: string;
  sourceLabel?: string;
};

/**
 * Inline "Defined in `<file>` • `<source>`" provenance for a cross-file entity. Callers
 * gate on `isCrossFile` — it renders nothing meaningful for a local entity.
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

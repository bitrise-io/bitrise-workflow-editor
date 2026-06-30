import { Text } from '@bitrise/bitkit';

type Props = {
  definingPaths?: string[];
  sourceLabel?: string;
  pathTextStyle?: string;
};

const MULTIPLE_LABEL = 'multiple modules';

// One or two defining files are listed by path; three or more collapse to "multiple modules".
// Falls back to "another file" when no path is known.
export const crossFileProvenanceLabel = (definingPaths: string[] = []) => {
  if (definingPaths.length > 2) {
    return `Defined in ${MULTIPLE_LABEL}`;
  }
  if (definingPaths.length === 0) {
    return 'Defined in another file';
  }
  return `Defined in ${definingPaths.join(', ')}`;
};

const CrossFileProvenanceText = ({ definingPaths = [], sourceLabel, pathTextStyle = 'body/sm/semibold' }: Props) => {
  const isMultiple = definingPaths.length > 2;
  const paths = isMultiple ? [MULTIPLE_LABEL] : definingPaths.length ? definingPaths : ['another file'];
  // The cross-repo source badge only makes sense for a single, concrete defining file (not the
  // "another file" fallback, nor the "multiple modules" summary).
  const showSource = Boolean(sourceLabel) && definingPaths.length === 1;

  return (
    <>
      Defined in{' '}
      <Text as="span" textStyle={pathTextStyle}>
        {paths.join(', ')}
      </Text>
      {showSource ? ` • ${sourceLabel}` : ''}
    </>
  );
};

export default CrossFileProvenanceText;

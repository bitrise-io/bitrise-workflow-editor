import { Box, Button, CodeSnippet, Dialog, DialogBody, DialogFooter, Link, Text } from '@bitrise/bitkit';

type Props = {
  isOpen: boolean;
  isMajorChange: boolean;
  releaseNotesUrl?: string;
  removedInputs: Array<string>;
  newInputs: Array<string>;
  onClose: VoidFunction;
};

const VersionChangeDialog = ({
  isOpen,
  isMajorChange,
  removedInputs = [],
  newInputs = [],
  releaseNotesUrl,
  onClose = () => {},
}: Props) => {
  const [title, context] = isMajorChange
    ? ['Major version change', 'The new major version likely contains breaking changes in the step behavior.']
    : ['Version change', 'The new version contains some input changes.'];

  return (
    <Dialog title={title} isOpen={isOpen} onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="16">
        <Text>
          {context}
          {releaseNotesUrl && (
            <>
              {' Please check the '}
              <Link href={releaseNotesUrl} isExternal colorScheme="purple">
                release notes
              </Link>
              .
            </>
          )}
        </Text>
        {removedInputs.length > 0 && (
          <>
            <Text textStyle="body/lg/semibold">
              The following inputs are not available in the selected version anymore:
            </Text>
            <Box display="flex" flexWrap="wrap" gap="12">
              {removedInputs.map((input) => (
                <CodeSnippet key={input}>{input}</CodeSnippet>
              ))}
            </Box>
          </>
        )}
        {newInputs.length > 0 && (
          <>
            <Text textStyle="body/lg/semibold">The following inputs are new in the selected version:</Text>
            <Box display="flex" flexWrap="wrap" gap="12">
              {newInputs.map((input) => (
                <CodeSnippet key={input}>{input}</CodeSnippet>
              ))}
            </Box>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default VersionChangeDialog;

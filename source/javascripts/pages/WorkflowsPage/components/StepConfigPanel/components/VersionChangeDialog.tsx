import { Box, Button, Dialog, DialogBody, DialogFooter, Link, Tag, Text } from '@bitrise/bitkit';

type ChangeProps = {
  isMajorChange: boolean;
  releaseNotesUrl?: string;
  removedInputs: Array<string>;
  newInputs: Array<string>;
};

type Props = ChangeProps & {
  isOpen: boolean;
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
                <Tag key={input}>{input}</Tag>
              ))}
            </Box>
          </>
        )}
        {newInputs.length > 0 && (
          <>
            <Text textStyle="body/lg/semibold">The following inputs are new in the selected version:</Text>
            <Box display="flex" flexWrap="wrap" gap="12">
              {newInputs.map((input) => (
                <Tag key={input}>{input}</Tag>
              ))}
            </Box>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} data-e2e-tag="close-version-change-dialog">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export { ChangeProps };

export default VersionChangeDialog;

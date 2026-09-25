import {
  BitkitBadge,
  BitkitButton,
  BitkitCodeSnippet,
  BitkitDialog,
  BitkitProvider,
  IconDownload,
} from '@bitrise/bitkit-v2';
import { HStack, Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { getUnsavedConfigFiles, isYmlPageLocation, UnsavedConfigFile } from '@/core/stores/BitriseYmlStore';
import { downloadYml, downloadYmlZip } from '@/core/utils/CommonUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';
import { navigate } from '@/hooks/useHashLocation';
import { getSearchStringFromLocationHash } from '@/hooks/useHashSearch';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

const CHANGED_FILES_ZIP = 'bitrise-configuration.zip';

function reloadIntoYmlEditor() {
  // Keep the hash query: `?branch=` lives there, and dropping it loads the default branch.
  navigate(`${paths.yml}${getSearchStringFromLocationHash()}`);
  WindowUtils.reloadEditor();
}

type DiscardChangesDialogProps = { isOpen: boolean; onCancel: () => void; onDiscard: () => void };

const DiscardChangesDialog = ({ isOpen, onCancel, onDiscard }: DiscardChangesDialogProps) => (
  <BitkitDialog
    title="Discard unsaved changes?"
    open={isOpen}
    onOpenChange={({ open }) => {
      if (!open) onCancel();
    }}
    footerButtons={
      <>
        <BitkitButton variant="secondary" onClick={onCancel}>
          Cancel
        </BitkitButton>
        <BitkitButton variant="danger-primary" onClick={onDiscard}>
          Discard and edit as YAML
        </BitkitButton>
      </>
    }
  >
    <Text>
      Opening the YAML editor reloads the page and discards your unsaved changes. Download them first if you want to
      keep them.
    </Text>
  </BitkitDialog>
);

// Never throws, and never returns an empty string: this runs in the last fallback there is.
function messageOf(thrown: unknown) {
  try {
    const message = thrown instanceof Error ? thrown.message || thrown.name : String(thrown ?? '');
    return message || 'An unknown error was thrown';
  } catch {
    return 'An unknown error was thrown';
  }
}

// This page is the last fallback, so a store it can't read means no downloads, not a blank screen.
function readUnsavedFiles(): UnsavedConfigFile[] {
  try {
    return getUnsavedConfigFiles();
  } catch {
    return [];
  }
}

// Datadog's boundary reports the error and, unlike a check on the error value, also catches a thrown
// `undefined`. The fallback never calls `resetError`: retrying re-renders the tree that just threw.
const ErrorPageFallback = ({ error }: { error: unknown }) => {
  // Read once, when the page first shows: nothing below the boundary edits the store any more, and
  // the files a re-render reads must be the ones the user was warned about.
  const [unsavedFiles] = useState(readUnsavedFiles);
  const hasUnsavedChanges = unsavedFiles.length > 0;
  const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);
  const message = messageOf(error);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  // Set once the user has agreed to discard, so the reload that follows doesn't ask a second time.
  const isDiscarding = useRef(false);

  // The loader's leave-page warning unmounted with the tree, and this page is where edits are most at risk.
  useEventListener('beforeunload', (e) => {
    // NOTE: The return is important for the browser to show the dialog
    return RuntimeUtils.isProduction() && hasUnsavedChanges && !isDiscarding.current && e.preventDefault();
  });

  const openYmlEditor = () => {
    if (hasUnsavedChanges) {
      setIsDiscardDialogOpen(true);
      return;
    }
    reloadIntoYmlEditor();
  };

  const discardAndOpenYmlEditor = () => {
    isDiscarding.current = true;
    setIsDiscardDialogOpen(false);
    reloadIntoYmlEditor();
  };

  return (
    <BitkitProvider>
      <ErrorPage eyebrow="Error – This page couldn't render" headline="This page couldn't be displayed">
        <Stack gap="12">
          <Text textStyle="body/lg/regular">
            The editor stopped because this page hit an error. If it keeps happening, send the error to Bitrise support.
          </Text>
          <BitkitCodeSnippet variant="multi">{message}</BitkitCodeSnippet>
        </Stack>
        {hasUnsavedChanges && (
          <Stack gap="8" alignItems="flex-start">
            <BitkitBadge colorVariant="yellow">Unsaved changes</BitkitBadge>
            <Text textStyle="body/lg/regular">
              Your changes only exist in this tab. Download them before you refresh or leave the page.
            </Text>
          </Stack>
        )}
        {(hasUnsavedChanges || offerYmlEditor) && (
          <HStack gap="12" flexWrap="wrap">
            {unsavedFiles.length === 1 && (
              <BitkitButton
                variant="primary"
                size="lg"
                icon={IconDownload}
                onClick={() => downloadYml(unsavedFiles[0].content, unsavedFiles[0].path)}
              >
                {`Download ${unsavedFiles[0].path}`}
              </BitkitButton>
            )}
            {unsavedFiles.length > 1 && (
              <BitkitButton
                variant="primary"
                size="lg"
                icon={IconDownload}
                onClick={() => downloadYmlZip(unsavedFiles, CHANGED_FILES_ZIP)}
              >
                {`Download ${unsavedFiles.length} changed files (.zip)`}
              </BitkitButton>
            )}
            {offerYmlEditor && (
              <BitkitButton variant={hasUnsavedChanges ? 'secondary' : 'primary'} size="lg" onClick={openYmlEditor}>
                Edit as YAML
              </BitkitButton>
            )}
          </HStack>
        )}
      </ErrorPage>
      <DiscardChangesDialog
        isOpen={isDiscardDialogOpen}
        onCancel={() => setIsDiscardDialogOpen(false)}
        onDiscard={discardAndOpenYmlEditor}
      />
    </BitkitProvider>
  );
};

const RootErrorBoundary = ({ children }: PropsWithChildren) => (
  <ErrorBoundary fallback={ErrorPageFallback}>{children}</ErrorBoundary>
);

export default RootErrorBoundary;

import { BitkitBadge, BitkitButton, BitkitCodeSnippet, BitkitProvider, IconDownload } from '@bitrise/bitkit-v2';
import { HStack, Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren } from 'react';
import { useEventListener } from 'usehooks-ts';

import { getUnsavedConfigFiles, isYmlPageLocation, UnsavedConfigFile } from '@/core/stores/BitriseYmlStore';
import { downloadYml } from '@/core/utils/CommonUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';
import { getSearchStringFromLocationHash } from '@/hooks/useHashSearch';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

const YML_ROUTE_IN_PARENT_HASH = `#!${paths.yml}`;

const DISCARD_UNSAVED_CHANGES_PROMPT =
  'Opening the YAML editor reloads the page and discards your unsaved changes. Download them first if you want to keep them. Continue anyway?';

function openYmlEditor(hasUnsavedChanges: boolean) {
  if (hasUnsavedChanges && !window.confirm(DISCARD_UNSAVED_CHANGES_PROMPT)) {
    return;
  }
  // Keep the hash query: `?branch=` lives there, and dropping it loads the default branch.
  window.parent.location.hash = `${YML_ROUTE_IN_PARENT_HASH}${getSearchStringFromLocationHash()}`;
  WindowUtils.reloadEditor();
}

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
  const unsavedFiles = readUnsavedFiles();
  const hasUnsavedChanges = unsavedFiles.length > 0;
  const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);
  const message = messageOf(error);

  // The loader's leave-page warning unmounted with the tree, and this page is where edits are most at risk.
  useEventListener('beforeunload', (e) => {
    // NOTE: The return is important for the browser to show the dialog
    return RuntimeUtils.isProduction() && hasUnsavedChanges && e.preventDefault();
  });

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
            {unsavedFiles.map((file) => (
              <BitkitButton
                key={file.path}
                variant="primary"
                size="lg"
                icon={IconDownload}
                onClick={() => downloadYml(file.content, file.path)}
              >
                {`Download ${file.path}`}
              </BitkitButton>
            ))}
            {offerYmlEditor && (
              <BitkitButton
                variant={hasUnsavedChanges ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => openYmlEditor(hasUnsavedChanges)}
              >
                Edit as YAML
              </BitkitButton>
            )}
          </HStack>
        )}
      </ErrorPage>
    </BitkitProvider>
  );
};

const RootErrorBoundary = ({ children }: PropsWithChildren) => (
  <ErrorBoundary fallback={ErrorPageFallback}>{children}</ErrorBoundary>
);

export default RootErrorBoundary;

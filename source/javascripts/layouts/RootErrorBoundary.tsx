import { BitkitBadge, BitkitButton, BitkitCodeSnippet, BitkitProvider, IconDownload } from '@bitrise/bitkit-v2';
import { HStack, Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren } from 'react';

import { ConfigFileForDownload, getConfigFilesForDownload, isYmlPageLocation } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import WindowUtils from '@/core/utils/WindowUtils';
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
  const query = window.parent.location.hash.split('?')[1];
  window.parent.location.hash = query ? `${YML_ROUTE_IN_PARENT_HASH}?${query}` : YML_ROUTE_IN_PARENT_HASH;
  WindowUtils.reloadEditor();
}

function messageOf(thrown: unknown) {
  if (thrown instanceof Error) {
    return thrown.message;
  }
  return thrown === undefined || thrown === null ? 'An unknown error was thrown' : String(thrown);
}

function readConfigFiles(): ConfigFileForDownload[] {
  try {
    return getConfigFilesForDownload();
  } catch {
    return [];
  }
}

function downloadConfigFile({ path, content }: ConfigFileForDownload) {
  download(content, path.replace(/\//g, '-'), 'application/yaml;charset=utf-8');
}

// Datadog's boundary reports the error and, unlike a check on the error value, also catches a thrown
// `undefined`. The fallback never calls `resetError`: retrying re-renders the tree that just threw.
const ErrorPageFallback = ({ error }: { error: unknown }) => {
  const unsavedFiles = readConfigFiles().filter((file) => file.hasUnsavedChanges);
  const hasUnsavedChanges = unsavedFiles.length > 0;
  const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);
  const message = messageOf(error);

  return (
    <BitkitProvider>
      <ErrorPage eyebrow="Error – This page couldn't render" headline="This page couldn't be displayed">
        <Stack gap="12">
          <Text textStyle="body/lg/regular">
            The editor stopped because this page hit an error. If it keeps happening, send the error to Bitrise support.
          </Text>
          {message && <BitkitCodeSnippet variant="multi">{message}</BitkitCodeSnippet>}
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
                onClick={() => downloadConfigFile(file)}
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

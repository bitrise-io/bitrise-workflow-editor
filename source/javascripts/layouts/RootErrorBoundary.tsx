import { BitkitBadge, BitkitButton, BitkitCodeSnippet, BitkitProvider, IconDownload } from '@bitrise/bitkit-v2';
import { HStack, Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren } from 'react';

import { ConfigFileForDownload, getConfigFilesForDownload, isYmlPageLocation } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

const YML_ROUTE_IN_PARENT_HASH = `#!${paths.yml}`;

const DISCARD_UNSAVED_CHANGES_PROMPT =
  'Reloading discards your unsaved changes. Download them first if you want to keep them. Reload anyway?';

function reload(hasUnsavedChanges: boolean, hash?: string) {
  if (hasUnsavedChanges && !window.confirm(DISCARD_UNSAVED_CHANGES_PROMPT)) {
    return;
  }
  if (hash) {
    window.parent.location.hash = hash;
  }
  window.location.reload();
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

const DownloadConfiguration = ({ files }: { files: ConfigFileForDownload[] }) => (
  <Stack gap="8" alignItems="flex-start">
    <Text textStyle="body/md/semibold">Download your configuration</Text>
    {files.map((file) => (
      <HStack key={file.path} gap="8">
        <BitkitButton variant="secondary" size="md" icon={IconDownload} onClick={() => downloadConfigFile(file)}>
          {file.path}
        </BitkitButton>
        {file.hasUnsavedChanges && <BitkitBadge colorVariant="yellow">Unsaved changes</BitkitBadge>}
      </HStack>
    ))}
  </Stack>
);

// Datadog's boundary reports the error and, unlike a check on the error value, also catches a thrown
// `undefined`. The fallback never calls `resetError`: retrying re-renders the tree that just threw.
const ErrorPageFallback = ({ error }: { error: unknown }) => {
  const files = readConfigFiles();
  const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);
  const message = messageOf(error);
  const hasUnsavedChanges = files.some((file) => file.hasUnsavedChanges);
  const savedState = hasUnsavedChanges
    ? 'You have unsaved changes, and they only exist in this tab. Download them first: reloading discards them.'
    : 'Your configuration is unchanged and nothing has been saved.';
  const nextStep = offerYmlEditor
    ? 'Keep working on the configuration as YAML, or reload to try again.'
    : 'Reload to try again.';
  const downloadSection = files.length > 0 && <DownloadConfiguration files={files} />;

  return (
    <BitkitProvider>
      <ErrorPage eyebrow="Error – This page couldn't render" headline="This page couldn't be displayed">
        <Text textStyle="body/lg/regular">
          {`${savedState} ${nextStep} If this keeps happening, send the error below to Bitrise support.`}
        </Text>
        {hasUnsavedChanges && downloadSection}
        <HStack gap="12">
          {offerYmlEditor && (
            <BitkitButton
              variant="primary"
              size="lg"
              onClick={() => reload(hasUnsavedChanges, YML_ROUTE_IN_PARENT_HASH)}
            >
              Edit as YAML
            </BitkitButton>
          )}
          <BitkitButton
            variant={offerYmlEditor ? 'secondary' : 'primary'}
            size="lg"
            onClick={() => reload(hasUnsavedChanges)}
          >
            Reload the editor
          </BitkitButton>
        </HStack>
        {!hasUnsavedChanges && downloadSection}
        {message && <BitkitCodeSnippet variant="multi">{message}</BitkitCodeSnippet>}
      </ErrorPage>
    </BitkitProvider>
  );
};

const RootErrorBoundary = ({ children }: PropsWithChildren) => (
  <ErrorBoundary fallback={ErrorPageFallback}>{children}</ErrorBoundary>
);

export default RootErrorBoundary;

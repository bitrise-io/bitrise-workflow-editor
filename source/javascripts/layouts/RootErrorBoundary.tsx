import { BitkitButton, BitkitCodeSnippet, BitkitProvider } from '@bitrise/bitkit-v2';
import { Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren } from 'react';

import { isYmlPageLocation } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import { navigate } from '@/hooks/useHashLocation';
import { getSearchParamsFromLocationHash } from '@/hooks/useSearchParams';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

// A reload, not a reset: a reset remounts the config loader, which would load the saved file over
// the edits anyway, and a crash in shared chrome would throw again on the YAML page.
function openYmlEditor() {
  // Keep only `?branch=`: dropping it loads the default branch. The rest (`workflow_id`, `pipeline`, …)
  // picks what the visual page shows, so keeping it would reopen the entity that crashed when the user
  // switches back to the Visual editor. The default page can still crash, e.g. when the first workflow
  // uses an alias; that lands on this page again, so it's never a loop the user can't leave.
  const { branch } = getSearchParamsFromLocationHash();
  navigate(branch ? `${paths.yml}?${new URLSearchParams({ branch })}` : paths.yml);
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

// Datadog's boundary reports the error and, unlike a check on the error value, also catches a thrown
// `undefined`. The fallback never calls `resetError`: retrying re-renders the tree that just threw.
const ErrorPageFallback = ({ error }: { error: unknown }) => {
  const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);

  return (
    <BitkitProvider>
      <ErrorPage eyebrow="Error – This page couldn't render" headline="This page couldn't be displayed">
        <Stack gap="12">
          <Text textStyle="body/lg/regular">
            The editor stopped because this page hit an error. If it keeps happening, send the error to Bitrise support.
          </Text>
          <BitkitCodeSnippet variant="multi">{messageOf(error)}</BitkitCodeSnippet>
        </Stack>
        {offerYmlEditor && (
          <BitkitButton alignSelf="start" variant="primary" size="lg" onClick={openYmlEditor}>
            Edit as YAML
          </BitkitButton>
        )}
      </ErrorPage>
    </BitkitProvider>
  );
};

const RootErrorBoundary = ({ children }: PropsWithChildren) => (
  <ErrorBoundary fallback={ErrorPageFallback}>{children}</ErrorBoundary>
);

export default RootErrorBoundary;

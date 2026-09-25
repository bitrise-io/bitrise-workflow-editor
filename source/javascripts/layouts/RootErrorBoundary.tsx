import { BitkitButton, BitkitCodeSnippet, BitkitProvider } from '@bitrise/bitkit-v2';
import { Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { PropsWithChildren } from 'react';

import { isYmlPageLocation } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import { navigate } from '@/hooks/useHashLocation';
import { getSearchStringFromLocationHash } from '@/hooks/useHashSearch';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

// A reload, not a reset: a reset remounts the config loader, which would load the saved file over
// the edits anyway, and a crash in shared chrome would throw again on the YAML page.
function openYmlEditor() {
  // Keep the hash query: `?branch=` lives there, and dropping it loads the default branch.
  navigate(`${paths.yml}${getSearchStringFromLocationHash()}`);
  WindowUtils.reloadEditor();
}

// Never throws, and never returns an empty string: this runs in the last fallback there is.
function messageOf(thrown: unknown) {
  try {
    // `String()` on an Error's fields too: a `message` can be overridden with a non-string at runtime.
    const message = String((thrown instanceof Error ? thrown.message || thrown.name : thrown) ?? '');
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

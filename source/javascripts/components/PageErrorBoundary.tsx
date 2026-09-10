import { BitkitButton } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { ComponentProps, PropsWithChildren } from 'react';

import useNavigation from '@/hooks/useNavigation';
import { paths } from '@/routes';

/**
 * A render error here is usually the config itself: the visual editor is driven by the YAML in the
 * store, and unsaved edits reach it without server validation. The store keeps those edits, so the
 * fix is to send the user to the YAML editor with their config intact rather than to reload — which
 * would recover the app by throwing their work away.
 */
const PageErrorFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ error, resetError }) => {
  const { replace } = useNavigation();

  const openYmlEditor = () => {
    replace(paths.yml);
    resetError();
  };

  return (
    <Box display="flex" justifyContent="center" padding="48">
      <Stack gap="16" maxWidth="480" alignItems="flex-start">
        <Text textStyle="heading/h3">This page couldn&apos;t be displayed</Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          Your unsaved changes are safe — nothing was saved or discarded. The configuration is most likely the cause, so
          you can open it in the YAML editor and correct it from there.
        </Text>
        {error?.message && (
          <Text textStyle="code/md" color="text/secondary">
            {error.message}
          </Text>
        )}
        <Box display="flex" gap="8">
          <BitkitButton variant="primary" size="md" onClick={openYmlEditor}>
            Edit configuration
          </BitkitButton>
          <BitkitButton variant="secondary" size="md" onClick={resetError}>
            Try again
          </BitkitButton>
        </Box>
      </Stack>
    </Box>
  );
};

/**
 * Wraps the routed page only, so the header, file tabs and navigation stay mounted when a page
 * throws — without them the user cannot reach the YAML editor, and their preserved edits would be
 * unreachable rather than merely unrendered.
 */
const PageErrorBoundary = ({ children }: PropsWithChildren) => {
  return <ErrorBoundary fallback={PageErrorFallback}>{children}</ErrorBoundary>;
};

export default PageErrorBoundary;

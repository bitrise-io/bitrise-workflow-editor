import { BitkitBadge, BitkitButton, BitkitCodeSnippet, BitkitProvider, IconDownload } from '@bitrise/bitkit-v2';
import { HStack, Stack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { addReactError } from '@datadog/browser-rum-react';
import { Component, ErrorInfo, PropsWithChildren } from 'react';

import { ConfigFileForDownload, getConfigFilesForDownload, isYmlPageLocation } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import ErrorPage from '@/layouts/ErrorPage';
import { paths } from '@/routes';

const YML_ROUTE_IN_PARENT_HASH = `#!${paths.yml}`;

function reloadEditor() {
  window.location.reload();
}

function openYmlEditorAndReload() {
  window.parent.location.hash = YML_ROUTE_IN_PARENT_HASH;
  window.location.reload();
}

function toError(thrown: unknown) {
  if (thrown instanceof Error) {
    return thrown;
  }
  return new Error(thrown === undefined || thrown === null ? 'An unknown error was thrown' : String(thrown));
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

type ErrorPageContentProps = { files: ConfigFileForDownload[]; offerYmlEditor: boolean };

const DownloadConfiguration = ({ files }: Pick<ErrorPageContentProps, 'files'>) => (
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

const FullErrorPage = ({ error, files, offerYmlEditor }: ErrorPageContentProps & { error: Error }) => {
  const savedState = files.some((file) => file.hasUnsavedChanges)
    ? 'Nothing has been saved, and reloading or leaving this page discards your unsaved changes. Download them first.'
    : 'Your configuration is unchanged and nothing has been saved.';
  const nextStep = offerYmlEditor
    ? 'Reload to try again, or keep working on the configuration as YAML.'
    : 'Reload to try again.';

  return (
    <ErrorPage eyebrow="Error – This page couldn't render" headline="This page couldn't be displayed">
      <Text textStyle="body/lg/regular">
        {`${savedState} ${nextStep} If this keeps happening, send the error below to Bitrise support.`}
      </Text>
      <HStack gap="12">
        <BitkitButton variant="primary" size="lg" onClick={reloadEditor}>
          Reload the editor
        </BitkitButton>
        {offerYmlEditor && (
          <BitkitButton variant="secondary" size="lg" onClick={openYmlEditorAndReload}>
            Edit as YAML
          </BitkitButton>
        )}
      </HStack>
      {files.length > 0 && <DownloadConfiguration files={files} />}
      {error.message && <BitkitCodeSnippet variant="multi">{error.message}</BitkitCodeSnippet>}
    </ErrorPage>
  );
};

class RootErrorBoundary extends Component<PropsWithChildren, { error: Error | null }> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(thrown: unknown) {
    return { error: toError(thrown) };
  }

  componentDidCatch(thrown: unknown, errorInfo: ErrorInfo) {
    addReactError(toError(thrown), errorInfo);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) {
      return children;
    }

    const files = readConfigFiles();
    const offerYmlEditor = !isYmlPageLocation(window.parent.location.hash);

    return (
      <BitkitProvider>
        <FullErrorPage error={error} files={files} offerYmlEditor={offerYmlEditor} />
      </BitkitProvider>
    );
  }
}

export default RootErrorBoundary;

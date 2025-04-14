import { useCallback, useEffect } from 'react';
import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useDisclosure, useResponsive, useToast } from '@bitrise/bitkit';

import { cloneDeep, noop } from 'es-toolkit';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { bitriseYmlStore, initFromServerResponse } from '@/core/stores/BitriseYmlStore';
import { useGetCiConfigYml, useSaveCiConfigYml } from '@/hooks/useCiConfig';
import useHashLocation from '@/hooks/useHashLocation';
import { ClientError } from '@/core/api/client';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import useFormattedYml from '@/hooks/useFormattedYml';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';

const onDiscard = () => {
  bitriseYmlStore.setState((s) => ({
    yml: cloneDeep(s.savedYml),
    ymlString: s.savedYmlString,
  }));
};

const Header = () => {
  const toast = useToast();
  const { isMobile } = useResponsive();
  const [pathWithSearchParams] = useHashLocation();
  const { isOpen: isDiffViewerOpen, onClose: closeDiffViewer, onOpen: openDiffViewer } = useDisclosure();
  const { isOpen: isMergeDialogOpen, onClose: closeMergeDialog, onOpen: openMergeDialog } = useDisclosure();

  const hasChanges = useBitriseYmlStore((s) => {
    return JSON.stringify(s.yml) !== JSON.stringify(s.savedYml) || s.ymlString !== s.savedYmlString;
  });

  const { isRefetching, refetch: refetchCiConfig } = useGetCiConfigYml(
    { projectSlug: PageProps.appSlug() },
    { enabled: false },
  );

  const onSaveSuccess = () => {
    // TODO: handle error
    refetchCiConfig().then(({ data }) => {
      if (data) {
        initFromServerResponse({ version: data.version, ymlString: data.data });
      }
    });
  };

  const onError = useCallback(
    (error: ClientError) => {
      if (error.status === 409) {
        openMergeDialog();
      } else {
        toast({
          title: 'Failed to save changes',
          description: error.getResponseErrorMessage() || error.message || 'Something went wrong',
          status: 'error',
          duration: null,
          isClosable: true,
        });
      }
    },
    [toast, openMergeDialog],
  );

  const { isPending: formatYmlIsPending, mutate: formatYml } = useFormattedYml();

  const { isPending: ciConfigYmlIsSaving, mutate: saveCiConfigYml } = useSaveCiConfigYml({
    onSuccess: onSaveSuccess,
    onError,
  });

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const appSlug = PageProps.appSlug();
  const appName = PageProps.app()?.name ?? '';
  const appPath = isWebsiteMode ? `/app/${appSlug}` : '';
  const isSaving = formatYmlIsPending || ciConfigYmlIsSaving || isRefetching;
  const tabOpenDuringSave = pathWithSearchParams.split('?')[0].split('/').pop();

  const saveCIConfig = useCallback(() => {
    formatYml(BitriseYmlApi.toYml(bitriseYmlStore.getState().yml), {
      onError,
      onSuccess: (formattedYml) => {
        bitriseYmlStore.setState({ ymlString: formattedYml });
        saveCiConfigYml({
          data: formattedYml,
          projectSlug: appSlug,
          version: bitriseYmlStore.getState().savedYmlStringVersion,
          tabOpenDuringSave,
        });
      },
    });
  }, [appSlug, saveCiConfigYml, formatYml, onError, tabOpenDuringSave]);

  const onCloseConfigMergeDialog = (method: 'close_button' | 'cancel_button') => {
    closeMergeDialog();

    segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
      tab_name: tabOpenDuringSave,
      popup_step_dismiss_method: method,
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && hasChanges && !isSaving) {
        e.preventDefault();
        saveCIConfig();
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [hasChanges, isSaving, saveCIConfig]);

  return (
    <Box
      gap="16"
      as="header"
      display="flex"
      paddingBlock={16}
      paddingInline={32}
      borderBottom="1px solid"
      flexDir={['column', 'row']}
      justifyContent="space-between"
      borderColor="separator.primary"
      alignItems={['flex-start', 'center']}
    >
      <Breadcrumb hasSeparatorBeforeFirst={isMobile}>
        {isWebsiteMode && !isMobile && <BreadcrumbLink href="/dashboard">Bitrise CI</BreadcrumbLink>}
        {isWebsiteMode && appPath && appName && <BreadcrumbLink href={appPath}>{appName}</BreadcrumbLink>}
        {(!isWebsiteMode || !isMobile) && (
          <BreadcrumbLink isCurrentPage>
            <Text id="away" textStyle="body/lg/semibold">
              Workflow Editor
            </Text>
          </BreadcrumbLink>
        )}
      </Breadcrumb>

      <Box
        gap="8"
        display="flex"
        justifyContent="stretch"
        flexDir={['column', 'row']}
        alignSelf={['stretch', 'flex-end']}
      >
        <Button
          size="sm"
          className="diff"
          variant="secondary"
          onClick={openDiffViewer}
          isDisabled={!hasChanges || isSaving}
        >
          Show diff
        </Button>
        <Button
          isDanger
          size="sm"
          className="discard"
          variant="secondary"
          onClick={onDiscard}
          isDisabled={!hasChanges || isSaving}
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="save"
          variant="primary"
          onClick={saveCIConfig}
          isLoading={isSaving}
          isDisabled={!hasChanges}
        >
          Save changes
        </Button>
      </Box>
      <DiffEditorDialog isOpen={isDiffViewerOpen} onClose={closeDiffViewer} />
      <ConfigMergeDialog isOpen={isMergeDialogOpen} onSave={noop} onClose={onCloseConfigMergeDialog} />
    </Box>
  );
};

export default Header;

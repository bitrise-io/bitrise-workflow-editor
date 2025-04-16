import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useDisclosure, useResponsive, useToast } from '@bitrise/bitkit';
import { cloneDeep } from 'es-toolkit';
import { useCallback, useEffect } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { ClientError } from '@/core/api/client';
import { bitriseYmlStore, initializeStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';

import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import UpdateConfigurationDialog from './unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';

const Header = () => {
  const appSlug = PageProps.appSlug();
  const appName = PageProps.app()?.name ?? '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const appPath = isWebsiteMode ? `/app/${appSlug}` : '';
  const { data: ciConfigSettings } = useCiConfigSettings();

  const toast = useToast();
  const { isMobile } = useResponsive();
  const currentPage = useCurrentPage();

  const {
    isOpen: isDiffViewerOpen,
    onOpen: openDiffViewer,
    onClose: closeDiffViewer,
  } = useDisclosure({
    onOpen: () => {
      segmentTrack('Workflow Editor Diff Button Clicked', {
        tab_name: currentPage,
      });
    },
  });

  const {
    isOpen: isMergeDialogOpen,
    onOpen: openMergeDialog,
    onClose: closeMergeDialog,
  } = useDisclosure({
    onOpen: () => {
      segmentTrack('Workflow Editor Config Merge Popup Shown', {
        tab_name: currentPage,
      });
    },
  });

  const {
    isOpen: isUpdateConfigDialogOpen,
    onOpen: openUpdateConfigDialog,
    onClose: closeUpdateConfigDialog,
  } = useDisclosure({
    onOpen: () => {
      // TODO: analytics
    },
  });

  const hasChanges = useBitriseYmlStore((s) => {
    return JSON.stringify(s.yml) !== JSON.stringify(s.savedYml) || s.ymlString !== s.savedYmlString;
  });

  const { isPending: isSaving, mutate: save } = useSaveCiConfig({
    onSuccess: initializeStore,
    onError: (error: ClientError) => {
      if (error.status === 409) {
        openMergeDialog();
        return;
      }

      segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
        source: 'save',
        tab_name: currentPage,
      });
      toast({
        title: 'Failed to save changes',
        description: error.getResponseErrorMessage() || error.message || 'Something went wrong',
        status: 'error',
        duration: null,
        isClosable: true,
      });
    },
  });

  const saveCIConfig = useCallback(
    (source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed') => {
      segmentTrack('Workflow Editor Save Button Clicked', {
        source,
        tab_name: currentPage,
      });

      if (ciConfigSettings?.usesRepositoryYml) {
        openUpdateConfigDialog();
        return;
      }

      save({
        projectSlug: appSlug,
        tabOpenDuringSave: currentPage,
        yml: bitriseYmlStore.getState().yml,
        version: bitriseYmlStore.getState().savedYmlVersion,
      });
    },
    [appSlug, currentPage, save, openUpdateConfigDialog, ciConfigSettings?.usesRepositoryYml],
  );

  const onDiscard = () => {
    segmentTrack('Workflow Editor Discard Button Clicked', {
      tab_name: currentPage,
    });
    bitriseYmlStore.setState((s) => ({
      discardKey: Date.now(),
      yml: cloneDeep(s.savedYml),
      ymlString: s.savedYmlString,
    }));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && hasChanges && !isSaving) {
        e.preventDefault();
        saveCIConfig('save_changes_keyboard_shortcut_pressed');
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
          isLoading={isSaving}
          isDisabled={!hasChanges}
          onClick={() => saveCIConfig('save_changes_button')}
        >
          Save changes
        </Button>
      </Box>
      <DiffEditorDialog isOpen={isDiffViewerOpen} onClose={closeDiffViewer} />
      <ConfigMergeDialog isOpen={isMergeDialogOpen} onClose={closeMergeDialog} />
      <UpdateConfigurationDialog isOpen={isUpdateConfigDialogOpen} onClose={closeUpdateConfigDialog} />
    </Box>
  );
};

export default Header;

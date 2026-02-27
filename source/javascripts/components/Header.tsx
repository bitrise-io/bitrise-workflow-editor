import {
  Box,
  Breadcrumb,
  BreadcrumbLink,
  Button,
  Tooltip,
  useDisclosure,
  useResponsive,
  useToast,
} from '@bitrise/bitkit';
import { useCallback } from 'react';
import { useEventListener } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { ClientError } from '@/core/api/client';
import ModularConfigApi from '@/core/api/ModularConfigApi';
import {
  bitriseYmlStore,
  discardBitriseYmlDocument,
  getYmlString,
  initializeBitriseYmlDocument,
} from '@/core/stores/BitriseYmlStore';
import {
  buildTreeFromFiles,
  discardAllChanges as discardModularChanges,
  getChangedEditableFiles,
  getOriginalTree,
  markAllFilesSaved,
  modularConfigStore,
} from '@/core/stores/ModularConfigStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import useIsModular from '@/hooks/useIsModular';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';

import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import UpdateConfigurationDialog from './unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';

const Header = () => {
  const appSlug = PageProps.appSlug();
  const appName = PageProps.app()?.name ?? '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const appPath = isWebsiteMode ? `/app/${appSlug}` : '';
  const { data: ciConfigSettings } = useCiConfigSettings();
  const isModular = useIsModular();

  const toast = useToast();
  const { isMobile } = useResponsive();
  const currentPage = useCurrentPage();
  const hasChanges = useYmlHasChanges();
  const ymlStatus = useYmlValidationStatus();

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

  const { isPending: isSaving, mutate: save } = useSaveCiConfig({
    onSuccess: initializeBitriseYmlDocument,
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
    async (source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed') => {
      segmentTrack('Workflow Editor Save Button Clicked', {
        source,
        tab_name: currentPage,
      });

      if (isModular) {
        if (isWebsiteMode) {
          openUpdateConfigDialog();
          return;
        }

        const changedFiles = getChangedEditableFiles();
        if (changedFiles.length === 0) return;

        const tree = getOriginalTree();
        const configTree = tree ? buildTreeFromFiles(modularConfigStore.getState().files, tree) : undefined;

        try {
          await ModularConfigApi.saveConfigFiles({
            projectSlug: appSlug,
            files: changedFiles.map((f) => ({ path: f.path, contents: f.currentContents })),
            configTree,
          });
          markAllFilesSaved();
        } catch (error) {
          toast({
            title: 'Failed to save changes',
            description: error instanceof Error ? error.message : 'Something went wrong',
            status: 'error',
            duration: null,
            isClosable: true,
          });
        }
        return;
      }

      if (ciConfigSettings?.usesRepositoryYml) {
        openUpdateConfigDialog();
        return;
      }

      save({
        projectSlug: appSlug,
        ymlString: getYmlString(),
        tabOpenDuringSave: currentPage,
        version: bitriseYmlStore.getState().version,
      });
    },
    [
      appSlug,
      currentPage,
      save,
      openUpdateConfigDialog,
      ciConfigSettings?.usesRepositoryYml,
      isModular,
      isWebsiteMode,
      toast,
    ],
  );

  const onDiscard = () => {
    segmentTrack('Workflow Editor Discard Button Clicked', { tab_name: currentPage });

    useWorkflowsPageStore.setState(useWorkflowsPageStore.getInitialState());
    usePipelinesPageStore.setState(usePipelinesPageStore.getInitialState());
    useStepBundlesPageStore.setState(useStepBundlesPageStore.getInitialState());

    if (isModular) {
      const version = bitriseYmlStore.getState().version;
      discardModularChanges(version);
    }

    discardBitriseYmlDocument();
  };

  useEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && hasChanges && !isSaving) {
      e.preventDefault();

      if (ymlStatus === 'invalid') {
        toast({
          title: 'YAML is invalid',
          description: 'Please fix the errors in your YAML configuration before saving.',
          status: 'error',
          duration: null,
          isClosable: true,
        });
        return;
      }

      saveCIConfig('save_changes_keyboard_shortcut_pressed');
    }
  });

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
        {(!isWebsiteMode || !isMobile) && <BreadcrumbLink isCurrentPage>Workflow Editor</BreadcrumbLink>}
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
        <Tooltip
          isDisabled={ymlStatus !== 'invalid'}
          placement={isMobile ? 'bottom' : 'bottom-start'}
          label="YAML is invalid, please fix it before saving."
        >
          <Button
            size="sm"
            className="save"
            variant="primary"
            isLoading={isSaving}
            isDisabled={!hasChanges || ymlStatus === 'invalid'}
            onClick={() => saveCIConfig('save_changes_button')}
          >
            Save changes
          </Button>
        </Tooltip>
      </Box>
      <DiffEditorDialog isOpen={isDiffViewerOpen} onClose={closeDiffViewer} />
      <ConfigMergeDialog isOpen={isMergeDialogOpen} onClose={closeMergeDialog} />
      <UpdateConfigurationDialog isOpen={isUpdateConfigDialogOpen} onClose={closeUpdateConfigDialog} />
    </Box>
  );
};

export default Header;

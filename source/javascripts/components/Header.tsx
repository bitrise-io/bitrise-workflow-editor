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
import { BitkitSegmentedControl, BitkitTooltip, IconCode, IconWebUi } from '@bitrise/bitkit-v2';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import {
  trackConfigMergePopupShown,
  trackPushConfigChangesPopupShown,
  trackSaveButtonClicked,
} from '@/core/analytics/ConfigManagementAnalytics';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { PushBranchConflict } from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import {
  applyModularSaveResult,
  bitriseYmlStore,
  discardBitriseYmlDocument,
  getTabLastLocation,
  getYmlString,
  initializeBitriseYmlDocument,
  recordActiveTabLocation,
} from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useSaveCiConfig, useSaveConfigTree } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { closeAIDrawer } from '@/hooks/useCloseAIDrawer';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useHashLocation from '@/hooks/useHashLocation';
import useIsYmlParseError from '@/hooks/useIsYmlParseError';
import usePushBranch, { PushBranchPayload } from '@/hooks/usePushBranch';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import { paths } from '@/routes';

import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';
import ModularConfigMergeDialog from './ConfigMergeDialog/ModularConfigMergeDialog';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import GlobalDiffEditorDialog from './DiffEditor/GlobalDiffEditorDialog';
import ConfigSettingsMenu from './unified-editor/ConfigSettingsMenu/ConfigSettingsMenu';
import PushBranchDialog from './unified-editor/PushBranchDialog/PushBranchDialog';
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
  const hasChanges = useYmlHasChanges();
  const isModular = useBitriseYmlStore((s) => !!s.tree);
  // `ymlStatus` gates saving + the validation badge (any schema/marker error blocks a save).
  // `isParseError` is narrower — it gates only the view switch, since the visual editor renders
  // any config that parses, even one with schema errors. Conflating the two forced users onto the
  // YAML view on every schema-invalid load (SSW-3087).
  const ymlStatus = useYmlValidationStatus();
  const isParseError = useIsYmlParseError();

  const [path, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();

  const isYmlPage = currentPage === 'yml';
  const editorView = isYmlPage ? 'yaml' : 'visual';

  // Remember the last visual page so switching back from YAML returns to it.
  const lastVisualPathnameRef = useRef<string>(paths.workflows);
  useEffect(() => {
    if (!isYmlPage) {
      lastVisualPathnameRef.current = path.split('?')[0];
    }
  }, [isYmlPage, path]);

  const handleEditorViewChange = useCallback(
    (value: string | null) => {
      if (value === 'yaml') {
        // Keep the active tab's visual page fresh: tab switches while in YAML
        // mode don't record locations, so this snapshot is what restores later.
        recordActiveTabLocation(window.parent.location.hash);
        const searchParamsString = new URLSearchParams(searchParams).toString();
        navigate(searchParamsString ? `${paths.yml}?${searchParamsString}` : paths.yml);
        return;
      }

      if (value === 'visual') {
        if (isParseError) {
          return;
        }

        // Modular tabs remember their own visual page — the active tab's memory
        // wins over the session-global last visual page.
        const { selectedNodeId } = bitriseYmlStore.getState();
        const tabLocation = selectedNodeId ? getTabLastLocation(selectedNodeId) : undefined;
        if (tabLocation) {
          navigate(tabLocation);
          return;
        }

        const searchParamsString = new URLSearchParams(searchParams).toString();
        navigate(
          searchParamsString ? `${lastVisualPathnameRef.current}?${searchParamsString}` : lastVisualPathnameRef.current,
        );
      }
    },
    [searchParams, navigate, isParseError],
  );

  const conversationId = useCiConfigExpertStore((s) => s.conversationId);
  const turnIndex = useCiConfigExpertStore((s) => s.turnIndex);
  const turnCount = useCiConfigExpertStore((s) => s.turnCount);

  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');

  const [mergeDialogContext, setMergeDialogContext] = useState({ targetBranch: '', isNewTargetBranch: false });
  // Modular (per-file) conflict resolution: the parsed 409 plus the branch/message
  // to re-push with after the user resolves each conflicting file.
  const [modularConflict, setModularConflict] = useState<{
    branch: string;
    message: string;
    conflict: PushBranchConflict;
  }>();
  const lastPushPayload = useRef<PushBranchPayload>();

  const {
    isOpen: isDiffViewerOpen,
    onOpen: openDiffViewer,
    onClose: closeDiffViewer,
  } = useDisclosure({
    onOpen: () => {
      closeAIDrawer();
      segmentTrack('Workflow Editor Diff Button Clicked', {
        tab_name: currentPage,
        ai_assistant_conversation_id: conversationId,
        turn_index: turnIndex,
      });
    },
  });

  const { isOpen: isMergeDialogOpen, onOpen: openMergeDialog, onClose: closeMergeDialog } = useDisclosure();
  const {
    isOpen: isModularMergeDialogOpen,
    onOpen: openModularMergeDialog,
    onClose: closeModularMergeDialog,
  } = useDisclosure();

  const {
    isOpen: isUpdateConfigDialogOpen,
    onOpen: openUpdateConfigDialog,
    onClose: closeUpdateConfigDialog,
  } = useDisclosure({
    onOpen: () => {
      // TODO: analytics
    },
  });

  const {
    isOpen: isPushBranchDialogOpen,
    onOpen: openPushBranchDialog,
    onClose: closePushBranchDialog,
  } = useDisclosure({
    onOpen: () => {
      trackPushConfigChangesPopupShown(bitriseYmlStore.getState().configBranch);
    },
  });

  const handleSaveMergeConflict = useCallback(() => {
    const configBranch = bitriseYmlStore.getState().configBranch;
    setMergeDialogContext({ targetBranch: configBranch ?? '', isNewTargetBranch: false });
    trackConfigMergePopupShown(currentPage, configBranch, false);
    closePushBranchDialog();
    openMergeDialog();
  }, [currentPage, closePushBranchDialog, openMergeDialog]);

  const { isPending: isSaving, mutate: save } = useSaveCiConfig({
    onSuccess: initializeBitriseYmlDocument,
  });

  // Local modular save: write changed module files to disk + reload the tree (no branch/PR locally).
  const { isPending: isSavingTree, mutate: saveConfigTree } = useSaveConfigTree({
    onSuccess: (config) => applyModularSaveResult({ root: config.root }),
    onError: (error: Error) => {
      segmentTrack('Workflow Editor Invalid Yml Popup Shown', { source: 'save', tab_name: currentPage });
      toast({
        title: 'Failed to save changes',
        description:
          (error instanceof ClientError ? error.getResponseErrorMessage() : undefined) ||
          error.message ||
          'Something went wrong',
        status: 'error',
        duration: null,
        isClosable: true,
      });
    },
  });

  const isSavingConfig = isSaving || isSavingTree;

  const { isPushPending, pushBranch, pushError, clearPushError } = usePushBranch({
    onSuccess: () => {
      closePushBranchDialog();
    },
    onMergeConflict: (branch, conflict) => {
      const configBranch = bitriseYmlStore.getState().configBranch;
      trackConfigMergePopupShown(currentPage, branch, branch !== configBranch);
      closePushBranchDialog();

      // Modular push: resolve every conflicting file in the per-file dialog.
      // Single-file push: fall back to the legacy whole-config merge dialog.
      if (conflict) {
        setModularConflict({ branch, message: lastPushPayload.current?.message ?? '', conflict });
        openModularMergeDialog();
        return;
      }

      setMergeDialogContext({ targetBranch: branch, isNewTargetBranch: branch !== configBranch });
      openMergeDialog();
    },
  });

  const handlePush = useCallback(
    (values: PushBranchPayload) => {
      clearPushError();
      // Remember the message so a modular conflict can re-push with it after resolution.
      lastPushPayload.current = values;
      pushBranch(values);
    },
    [clearPushError, pushBranch],
  );

  const saveCIConfig = useCallback(
    (source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed') => {
      trackSaveButtonClicked(source, currentPage, bitriseYmlStore.getState().configBranch, conversationId, turnCount);

      // Local modular config: save straight to disk (there's no branch/PR locally).
      if (isModular && !isWebsiteMode) {
        saveConfigTree();
        return;
      }

      if (ciConfigSettings?.usesRepositoryYml) {
        if (enableBranchSwitching) {
          openPushBranchDialog();
        } else {
          openUpdateConfigDialog();
        }
        return;
      }

      save(
        {
          projectSlug: appSlug,
          ymlString: getYmlString(),
          tabOpenDuringSave: currentPage,
          version: bitriseYmlStore.getState().version,
          conversationId,
        },
        {
          onError: (error: ClientError) => {
            if (error.status === 409) {
              handleSaveMergeConflict();
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
        },
      );
    },
    [
      currentPage,
      conversationId,
      turnCount,
      ciConfigSettings?.usesRepositoryYml,
      save,
      isModular,
      isWebsiteMode,
      saveConfigTree,
      appSlug,
      enableBranchSwitching,
      openPushBranchDialog,
      openUpdateConfigDialog,
      handleSaveMergeConflict,
      toast,
    ],
  );

  const onDiscard = () => {
    segmentTrack('Workflow Editor Discard Button Clicked', {
      tab_name: currentPage,
      ai_assistant_conversation_id: conversationId,
      turn_count: turnCount,
    });

    useWorkflowsPageStore.setState(useWorkflowsPageStore.getInitialState());
    usePipelinesPageStore.setState(usePipelinesPageStore.getInitialState());
    useStepBundlesPageStore.setState(useStepBundlesPageStore.getInitialState());
    useCiConfigExpertStore.setState(useCiConfigExpertStore.getInitialState());

    discardBitriseYmlDocument();
  };

  useEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && hasChanges && !isSavingConfig) {
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
      <Box display="flex" alignItems="center" gap="8" minWidth={0}>
        <Breadcrumb hasSeparatorBeforeFirst={isMobile}>
          {isWebsiteMode && !isMobile && <BreadcrumbLink href="/dashboard">Bitrise CI</BreadcrumbLink>}
          {isWebsiteMode && appPath && appName && <BreadcrumbLink href={appPath}>{appName}</BreadcrumbLink>}
          {(!isWebsiteMode || !isMobile) && <BreadcrumbLink isCurrentPage>CI configuration</BreadcrumbLink>}
        </Breadcrumb>
        {isWebsiteMode && <ConfigSettingsMenu />}
      </Box>

      <BitkitTooltip
        disabled={!isParseError}
        placement={isMobile ? 'bottom' : 'bottom-start'}
        text="YAML can't be parsed, please fix it before switching to the Visual editor."
      >
        <BitkitSegmentedControl
          size="sm"
          value={editorView}
          aria-label="Editor view"
          onValueChange={(details) => handleEditorViewChange(details.value)}
        >
          <BitkitSegmentedControl.Item icon={IconWebUi} value="visual" disabled={isParseError}>
            Visual
          </BitkitSegmentedControl.Item>
          <BitkitSegmentedControl.Item icon={IconCode} value="yaml">
            YAML
          </BitkitSegmentedControl.Item>
        </BitkitSegmentedControl>
      </BitkitTooltip>

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
          isDisabled={!hasChanges || isSavingConfig}
        >
          Show diff
        </Button>
        <Button
          isDanger
          size="sm"
          className="discard"
          variant="secondary"
          onClick={onDiscard}
          isDisabled={!hasChanges || isSavingConfig}
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
            isLoading={isSavingConfig}
            isDisabled={!hasChanges || ymlStatus === 'invalid'}
            onClick={() => saveCIConfig('save_changes_button')}
          >
            Save changes
          </Button>
        </Tooltip>
      </Box>
      {isModular ? (
        <GlobalDiffEditorDialog isOpen={isDiffViewerOpen} onClose={closeDiffViewer} />
      ) : (
        <DiffEditorDialog isOpen={isDiffViewerOpen} onClose={closeDiffViewer} />
      )}
      <ConfigMergeDialog
        isOpen={isMergeDialogOpen}
        onClose={closeMergeDialog}
        targetBranch={mergeDialogContext.targetBranch}
        isNewTargetBranch={mergeDialogContext.isNewTargetBranch}
      />
      {modularConflict && (
        <ModularConfigMergeDialog
          isOpen={isModularMergeDialogOpen}
          onClose={closeModularMergeDialog}
          branch={modularConflict.branch}
          message={modularConflict.message}
          conflict={modularConflict.conflict}
        />
      )}
      <UpdateConfigurationDialog isOpen={isUpdateConfigDialogOpen} onClose={closeUpdateConfigDialog} />
      <PushBranchDialog
        isOpen={isPushBranchDialogOpen}
        onClose={() => {
          clearPushError();
          closePushBranchDialog();
        }}
        isPushPending={isPushPending}
        pushError={pushError}
        onPush={handlePush}
        onManualUpdate={openUpdateConfigDialog}
      />
    </Box>
  );
};

export default Header;

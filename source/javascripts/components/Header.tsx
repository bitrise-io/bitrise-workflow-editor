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
import { BitkitSegmentedControl, IconCode, IconWebUi } from '@bitrise/bitkit-v2';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import {
  trackConfigMergePopupShown,
  trackPushConfigChangesPopupShown,
  trackSaveButtonClicked,
} from '@/core/analytics/ConfigManagementAnalytics';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { ClientError } from '@/core/api/client';
import {
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
import { useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { closeAIDrawer } from '@/hooks/useCloseAIDrawer';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useHashLocation from '@/hooks/useHashLocation';
import usePushBranch, { PushBranchPayload } from '@/hooks/usePushBranch';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import { paths } from '@/routes';

import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import GlobalDiffEditorDialog from './DiffEditor/GlobalDiffEditorDialog';
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
  const ymlStatus = useYmlValidationStatus();

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
        if (ymlStatus === 'invalid') {
          toast({
            status: 'error',
            title: 'Invalid YAML',
            description: 'Please fix the errors in your YAML configuration before navigating.',
            duration: null,
            isClosable: true,
          });
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
    [searchParams, navigate, ymlStatus, toast],
  );

  const conversationId = useCiConfigExpertStore((s) => s.conversationId);
  const turnIndex = useCiConfigExpertStore((s) => s.turnIndex);
  const turnCount = useCiConfigExpertStore((s) => s.turnCount);

  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');

  const [mergeDialogContext, setMergeDialogContext] = useState({ targetBranch: '', isNewTargetBranch: false });

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

  const { isPushPending, pushBranch, pushError, clearPushError } = usePushBranch({
    onSuccess: () => {
      closePushBranchDialog();
    },
    onMergeConflict: (branch) => {
      const configBranch = bitriseYmlStore.getState().configBranch;
      setMergeDialogContext({ targetBranch: branch, isNewTargetBranch: branch !== configBranch });
      trackConfigMergePopupShown(currentPage, branch, branch !== configBranch);
      closePushBranchDialog();
      openMergeDialog();
    },
  });

  const handlePush = useCallback(
    (values: PushBranchPayload) => {
      clearPushError();
      pushBranch(values);
    },
    [clearPushError, pushBranch],
  );

  const saveCIConfig = useCallback(
    (source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed') => {
      trackSaveButtonClicked(source, currentPage, bitriseYmlStore.getState().configBranch, conversationId, turnCount);

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

      <BitkitSegmentedControl
        size="sm"
        value={editorView}
        aria-label="Editor view"
        onValueChange={(details) => handleEditorViewChange(details.value)}
      >
        <BitkitSegmentedControl.Item icon={IconWebUi} value="visual">
          Visual
        </BitkitSegmentedControl.Item>
        <BitkitSegmentedControl.Item icon={IconCode} value="yaml">
          YAML
        </BitkitSegmentedControl.Item>
      </BitkitSegmentedControl>

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

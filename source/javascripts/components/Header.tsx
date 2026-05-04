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
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import {
  bitriseYmlStore,
  discardBitriseYmlDocument,
  getYmlString,
  initializeBitriseYmlDocument,
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
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';

import ConfigMergeDialog from './ConfigMergeDialog/ConfigMergeDialog';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';
import PushBranchDialog, { PushBranchFormValues } from './unified-editor/PushBranchDialog/PushBranchDialog';
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
  const ymlStatus = useYmlValidationStatus();

  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const conversationId = useCiConfigExpertStore((s) => s.conversationId);
  const turnIndex = useCiConfigExpertStore((s) => s.turnIndex);
  const turnCount = useCiConfigExpertStore((s) => s.turnCount);

  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');

  const [pushError, setPushError] = useState<string | undefined>();

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

  const {
    isOpen: isPushBranchDialogOpen,
    onOpen: openPushBranchDialog,
    onClose: closePushBranchDialog,
  } = useDisclosure({
    onClose: () => {
      setPushError(undefined);
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

  const { isPending: isPushPending, mutate: pushBranch } = useMutation({
    mutationFn: ({ branch, message }: PushBranchFormValues) =>
      BranchesApi.pushBranch({
        appSlug,
        branch,
        sourceBranch: configBranch ?? '',
        commitSha: configCommitSha ?? '',
        bitriseYml: getYmlString(),
        message,
      }),
    onSuccess: (data) => {
      closePushBranchDialog();
      toast({
        title: 'Changes pushed successfully',
        description: 'Continue in your git provider and open a pull request.',
        status: 'success',
        isClosable: true,
        action: data?.pr_url ? { label: 'Open PR', href: data.pr_url, target: '_blank' } : undefined,
      });
    },
    onError: (error) => {
      if (error instanceof ClientError && error.status === 409) {
        closePushBranchDialog();
        openMergeDialog();
        return;
      }

      if (error instanceof ClientError && error.status === 403) {
        setPushError("You don't have permission to push to this branch.");
      } else {
        setPushError('Failed to push changes. Please try again.');
      }
    },
  });

  const saveCIConfig = useCallback(
    (source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed') => {
      segmentTrack('Workflow Editor Save Button Clicked', {
        source,
        tab_name: currentPage,
        ai_assistant_conversation_id: conversationId,
        turn_count: turnCount,
      });

      if (ciConfigSettings?.usesRepositoryYml) {
        if (enableBranchSwitching) {
          openPushBranchDialog();
        } else {
          openUpdateConfigDialog();
        }
        return;
      }

      save({
        projectSlug: appSlug,
        ymlString: getYmlString(),
        tabOpenDuringSave: currentPage,
        version: bitriseYmlStore.getState().version,
        conversationId,
      });
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
      <PushBranchDialog
        isOpen={isPushBranchDialogOpen}
        onClose={closePushBranchDialog}
        isPushPending={isPushPending}
        pushError={pushError}
        onPush={pushBranch}
        onManualUpdate={openUpdateConfigDialog}
      />
    </Box>
  );
};

export default Header;

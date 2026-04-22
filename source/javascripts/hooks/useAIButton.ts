import { useEffect, useState } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import WindowUtils from '@/core/utils/WindowUtils';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useParentMessageListener from '@/hooks/useParentMessageListener';

import { getAIDrawerOpen, setAIDrawerOpen, subscribeAIDrawerOpen } from '../core/utils/AIDrawer';

type OpenCiConfigExpertPayload = {
  action: string;
  bitriseYmlContents: string;
  selectedPage: string;
  yamlSelector: string;
};

type AIButtonProps = {
  isDisabled: boolean;
  onClick: () => void;
};

type UseAIButtonOptions = {
  action: string;
  source?: string;
  yamlSelector?: string;
};

type UseAIButtonResult = {
  isVisible: boolean;
  tooltipLabel?: string;
  getAIButtonProps: () => AIButtonProps;
};

function useAIDrawerOpen(): boolean {
  const [isOpen, setIsOpen] = useState(getAIDrawerOpen);

  useEffect(() => {
    return subscribeAIDrawerOpen(() => setIsOpen(getAIDrawerOpen()));
  }, []);

  return isOpen;
}

const useAIButton = (options: UseAIButtonOptions): UseAIButtonResult => {
  const { action, source, yamlSelector = 'workflow' } = options;
  const [isAgenticRunInProgress, setIsAgenticRunInProgress] = useState(false);
  const isAIDrawerOpen = useAIDrawerOpen();
  const enableCiConfigExpertAgent = useFeatureFlag('enable-ci-config-expert-agent');
  const selectedPage = useCurrentPage();
  const conversationId = useCiConfigExpertStore((s) => s.conversationId);
  const turnCount = useCiConfigExpertStore((s) => s.turnCount);

  useParentMessageListener('DISABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(true);
  });

  useParentMessageListener('ENABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(false);
  });

  useParentMessageListener('CI_CONFIG_EXPERT_CLOSED', () => {
    setAIDrawerOpen(false);
  });

  const ciConfigExpert = PageProps.settings()?.ai.ciConfigExpert;
  const isEnabledByWorkspace = !!ciConfigExpert && ciConfigExpert.disabled !== 'by-workspace';
  const isVisible = enableCiConfigExpertAgent && isEnabledByWorkspace;

  let tooltipLabel;
  let isDisabled = false;

  if (isVisible) {
    if (isAgenticRunInProgress) {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available while an agentic run is in progress.';
    } else if (isAIDrawerOpen) {
      isDisabled = true;
    } else if (ciConfigExpert?.disabled === 'by-project') {
      isDisabled = true;
      tooltipLabel = 'AI functions are disabled. Go to Project settings to turn them on.';
    } else if (ciConfigExpert?.disabled === 'unsupported') {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available on your current plan.';
    }
  }

  const onClick = () => {
    segmentTrack('AI Assistant Opened', {
      workspace_slug: GlobalProps.workspaceSlug(),
      app_slug: PageProps.appSlug(),
      source,
      ai_assistant_conversation_id: conversationId,
      ai_assistant_action: action,
      is_resumed: !!turnCount,
      prior_turn_count: turnCount ?? 0,
      ai_assistant_type: 'ai_config_assistant',
    });

    const payload: OpenCiConfigExpertPayload = {
      action,
      bitriseYmlContents: getYmlString(),
      selectedPage: selectedPage || '',
      yamlSelector,
    };
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', payload);
    setAIDrawerOpen(true);
  };

  const getAIButtonProps = (): AIButtonProps => ({ isDisabled, onClick });

  return { isVisible, tooltipLabel, getAIButtonProps };
};

export default useAIButton;

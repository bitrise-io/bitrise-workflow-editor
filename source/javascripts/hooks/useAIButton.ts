import { useState } from 'react';

import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import WindowUtils from '@/core/utils/WindowUtils';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useParentMessageListener from '@/hooks/useParentMessageListener';

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
  action?: string;
  yamlSelector?: string;
};

type UseAIButtonResult = {
  isVisible: boolean;
  tooltipLabel?: string;
  getAIButtonProps: () => AIButtonProps;
};

const useAIButton = (options: UseAIButtonOptions = {}): UseAIButtonResult => {
  const { action = 'create', yamlSelector = 'workflow' } = options;
  const [isAgenticRunInProgress, setIsAgenticRunInProgress] = useState(false);
  const enableCiConfigExpertAgent = useFeatureFlag('enable-ci-config-expert-agent');
  const selectedPage = useCurrentPage();

  useParentMessageListener('DISABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(true);
  });

  useParentMessageListener('ENABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(false);
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
    } else if (ciConfigExpert?.disabled === 'by-project') {
      isDisabled = true;
      tooltipLabel = 'AI functions are disabled. Go to Project settings to turn them on.';
    } else if (ciConfigExpert?.disabled === 'unsupported') {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available on your current plan.';
    }
  }

  const onClick = () => {
    const payload: OpenCiConfigExpertPayload = {
      action,
      bitriseYmlContents: getYmlString(),
      selectedPage: selectedPage || '',
      yamlSelector,
    };
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', payload);
  };

  const getAIButtonProps = (): AIButtonProps => ({ isDisabled, onClick });

  return { isVisible, tooltipLabel, getAIButtonProps };
};

export default useAIButton;

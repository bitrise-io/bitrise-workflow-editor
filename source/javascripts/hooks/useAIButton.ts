import { useState } from 'react';

import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import PageProps from '@/core/utils/PageProps';
import WindowUtils from '@/core/utils/WindowUtils';
import useCurrentPage from '@/hooks/useCurrentPage';
import useParentMessageListener from '@/hooks/useParentMessageListener';
import { useTree } from '@/hooks/useTree';

type OpenCiConfigExpertPayload = {
  action: string;
  bitriseYmlContents: string;
  selectedPage: string;
  source?: string;
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

const useAIButton = (options: UseAIButtonOptions): UseAIButtonResult => {
  const { action, source, yamlSelector = 'workflow' } = options;
  const [isAgenticRunInProgress, setIsAgenticRunInProgress] = useState(false);
  const isAIDrawerOpen = useCiConfigExpertStore((s) => s.isAIDrawerOpen);
  const selectedPage = useCurrentPage();

  useParentMessageListener('DISABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(true);
  });

  useParentMessageListener('ENABLE_AI_BUTTONS', () => {
    setIsAgenticRunInProgress(false);
  });

  useParentMessageListener('CI_CONFIG_EXPERT_CLOSED', () => {
    useCiConfigExpertStore.setState({ isAIDrawerOpen: false });
    setIsAgenticRunInProgress(false);
  });

  // The CI config expert operates on the whole bitrise.yml; modular configs aren't handled yet, so
  // hide every AI entry point while a modular config is open rather than offer a broken action (BIVS-3735).
  const isModular = Boolean(useTree());

  // The monolith folds the plan entitlement and the workspace- and project-level opt-in into this
  // one value, so every AI entry point on both sides of the iframe reads the same verdict. Only a
  // workspace the assistant isn't available to at all hides them: an opted-out project still gets
  // working buttons, and the parent answers the click with the opt-in modal instead of the drawer.
  const availability = PageProps.settings()?.ai?.ciConfigExpert?.availability;
  const isVisible = !!availability && availability !== 'unavailable' && !isModular;

  let tooltipLabel;
  let isDisabled = false;

  if (isVisible) {
    if (isAgenticRunInProgress) {
      isDisabled = true;
      tooltipLabel = 'AI functions are not available while an agentic run is in progress.';
    } else if (isAIDrawerOpen) {
      isDisabled = true;
    }
  }

  const onClick = () => {
    // The website is the canonical emitter of "AI Assistant Opened": it fires the event when the
    // drawer actually opens, for every entry point, using the `source` carried in the payload below.
    // Tracking it here too would double-count every editor-initiated open.
    const payload: OpenCiConfigExpertPayload = {
      action,
      bitriseYmlContents: getYmlString(),
      selectedPage: selectedPage || '',
      source,
      yamlSelector,
    };
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', payload);
    useCiConfigExpertStore.setState({ isAIDrawerOpen: true });
  };

  const getAIButtonProps = (): AIButtonProps => ({ isDisabled, onClick });

  return { isVisible, tooltipLabel, getAIButtonProps };
};

export default useAIButton;

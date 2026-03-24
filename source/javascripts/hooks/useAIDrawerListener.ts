import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import useParentMessageListener from '@/hooks/useParentMessageListener';

type UseAIDrawerListenerOptions = {
  action?: string;
  selectedPage: string;
  yamlSelector: string;
};

const useAIDrawerListener = ({ action = 'create', selectedPage, yamlSelector }: UseAIDrawerListenerOptions) => {
  useParentMessageListener<{ bitriseYmlContents: string }>('CI_CONFIG_RECEIVED', (payload) => {
    updateBitriseYmlDocumentByString(payload.bitriseYmlContents);
  });

  useParentMessageListener('REQUEST_AI_DRAWER_OPEN', () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      action,
      bitriseYmlContents: getYmlString(),
      selectedPage,
      yamlSelector,
    });
  });
};

export default useAIDrawerListener;

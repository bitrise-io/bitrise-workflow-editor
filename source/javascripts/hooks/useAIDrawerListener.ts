import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import useCurrentPage from '@/hooks/useCurrentPage';
import useParentMessageListener from '@/hooks/useParentMessageListener';

const useAIDrawerListener = () => {
  const selectedPage = useCurrentPage();
  const yamlSelector = selectedPage === 'workflows' || selectedPage === 'pipelines' ? selectedPage : undefined;

  useParentMessageListener<{ bitriseYmlContents: string }>('CI_CONFIG_RECEIVED', (payload) => {
    updateBitriseYmlDocumentByString(payload.bitriseYmlContents);
  });

  useParentMessageListener('REQUEST_AI_DRAWER_OPEN', () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      action: 'create',
      bitriseYmlContents: getYmlString(),
      selectedPage,
      yamlSelector,
    });
  });
};

export default useAIDrawerListener;

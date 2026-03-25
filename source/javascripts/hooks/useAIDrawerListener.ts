import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import useHashLocation from '@/hooks/useHashLocation';
import useParentMessageListener from '@/hooks/useParentMessageListener';
import { paths } from '@/routes';

type PageConfig = {
  selectedPage: string;
  yamlSelector?: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  [paths.workflows]: { selectedPage: 'workflows', yamlSelector: 'workflow' },
  [paths.pipelines]: { selectedPage: 'pipelines', yamlSelector: 'pipeline' },
  [paths.stepBundles]: { selectedPage: 'step_bundles' },
  [paths.secrets]: { selectedPage: 'secrets' },
  [paths.envVars]: { selectedPage: 'env_vars' },
  [paths.triggers]: { selectedPage: 'triggers' },
  [paths.containers]: { selectedPage: 'containers' },
  [paths.stacksAndMachines]: { selectedPage: 'stacks_and_machines' },
  [paths.licenses]: { selectedPage: 'licenses' },
  [paths.yml]: { selectedPage: 'configuration_yml' },
};

const useAIDrawerListener = () => {
  const [pathWithSearchParams] = useHashLocation();
  const currentPath = `/${pathWithSearchParams.split('?')[0].split('/').filter(Boolean)[0] ?? ''}`;
  const pageConfig = PAGE_CONFIG[currentPath];

  useParentMessageListener<{ bitriseYmlContents: string }>('CI_CONFIG_RECEIVED', (payload) => {
    updateBitriseYmlDocumentByString(payload.bitriseYmlContents);
  });

  useParentMessageListener('REQUEST_AI_DRAWER_OPEN', () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      action: 'create',
      bitriseYmlContents: getYmlString(),
      selectedPage: pageConfig?.selectedPage,
      yamlSelector: pageConfig?.yamlSelector,
    });
  });
};

export default useAIDrawerListener;

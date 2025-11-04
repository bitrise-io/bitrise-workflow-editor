import '../source/javascripts/typings/globals.d.ts';

import { Provider } from '@bitrise/bitkit';
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { useEffect } from 'react';

import { bitriseYmlStore } from '../source/javascripts/core/stores/BitriseYmlStore';
import YmlUtils from '../source/javascripts/core/utils/YmlUtils';

initialize({ serviceWorker: { url: './mockServiceWorker.js' } });

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 3 } },
});

const preview: Preview = {
  beforeEach: () => {
    queryClient.clear();
    window.env.MODE = 'WEBSITE';
    window.parent.globalProps = {
      user: { slug: 'user-1', username: 'ninja' },
      account: { slug: 'account-1', name: 'Mando' },
    };
    window.parent.pageProps = {
      abilities: { canRunBuilds: true },
      limits: { uniqueStepLimit: undefined, isPipelinesAvailable: true },
      project: {
        slug: 'asd-123',
        name: 'Mock Project',
        defaultBranch: 'main',
        buildTriggerToken: 'bt-1',
      },
    };

    return () => {
      window.env.MODE = 'CLI';
      window.parent.globalProps = undefined;
      window.parent.pageProps = undefined;
    };
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story, context) => {
      useEffect(() => {
        bitriseYmlStore.setState({
          yml: TEST_BITRISE_YML,
          ymlDocument: YmlUtils.toDoc(YmlUtils.toYml(TEST_BITRISE_YML as never)),
          savedYmlDocument: YmlUtils.toDoc(YmlUtils.toYml(TEST_BITRISE_YML as never)),
        });
      }, []);

      useEffect(() => {
        if (context.parameters.bitriseYmlStore) {
          bitriseYmlStore.setState(context.parameters.bitriseYmlStore);
        }
      }, [context.parameters.bitriseYmlStore]);

      return (
        <Provider>
          <QueryClientProvider client={queryClient}>
            <ReactFlowProvider>
              <Story />
            </ReactFlowProvider>
          </QueryClientProvider>
        </Provider>
      );
    },
  ],
  loaders: [mswLoader],
};

export default preview;

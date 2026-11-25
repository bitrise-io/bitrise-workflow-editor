import '../source/javascripts/typings/globals.d.ts';
import '@xyflow/react/dist/style.css';

import { BitkitProvider } from '@bitrise/bitkit-v2';
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { useEffect, useLayoutEffect } from 'react';

import { bitriseYmlStore } from '../source/javascripts/core/stores/BitriseYmlStore';
import YmlUtils from '../source/javascripts/core/utils/YmlUtils';

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
  // The editor copies the website's colour mode onto its <html> (source/index.html); this toolbar does the same.
  globalTypes: {
    colorMode: {
      description: 'Bitkit colour mode',
      toolbar: {
        title: 'Colour mode',
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: { colorMode: 'light' },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },

    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story, { globals }) => {
      const colorMode = globals.colorMode === 'dark' ? 'dark' : 'light';

      useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', colorMode === 'dark');
        root.classList.toggle('light', colorMode === 'light');
        root.style.colorScheme = colorMode;
      }, [colorMode]);

      return <Story />;
    },
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
        <BitkitProvider>
          <QueryClientProvider client={queryClient}>
            <ReactFlowProvider>
              <Story />
            </ReactFlowProvider>
          </QueryClientProvider>
        </BitkitProvider>
      );
    },
  ],
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker();
      await worker.start({ serviceWorker: { url: './mockServiceWorker.js' } });
      return worker;
    }),
  ],
};

export default preview;

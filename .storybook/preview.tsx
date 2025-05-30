import "../source/javascripts/typings/globals.d.ts";

import { ReactFlowProvider } from "@xyflow/react";
import { Provider } from "@bitrise/bitkit";
import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withBitriseYml } from "./withBitriseYml";
import { stringify } from "yaml";

initialize({ serviceWorker: { url: "./mockServiceWorker.js" } });

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 3 } },
});

process.env.MODE = "website";

const preview: Preview = {
  beforeEach: () => {
    queryClient.clear();
    process.env.MODE = "website";
    window.parent.globalProps = {
      user: { slug: "user-1", username: "ninja" },
      account: { slug: "account-1", name: "Mando" },
    };
    window.parent.pageProps = {
      abilities: { canRunBuilds: true },
      limits: { uniqueStepLimit: undefined, isPipelinesAvailable: true },
      project: {
        slug: "asd-123",
        name: "Mock Project",
        defaultBranch: "main",
        buildTriggerToken: "bt-1",
      },
    };

    return () => {
      process.env.MODE = "cli";
      window.parent.globalProps = undefined;
      window.parent.pageProps = undefined;
    };
  },
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story, context) => (
      <Provider>
        <QueryClientProvider client={queryClient}>
          <ReactFlowProvider>
            {withBitriseYml(
              {
                yml: TEST_BITRISE_YML,
                savedYml: TEST_BITRISE_YML,
                ymlString: stringify(TEST_BITRISE_YML),
                savedYmlString: stringify(TEST_BITRISE_YML),
                ...context.parameters.bitriseYmlStore,
              },
              Story,
            )}
          </ReactFlowProvider>
        </QueryClientProvider>
      </Provider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;

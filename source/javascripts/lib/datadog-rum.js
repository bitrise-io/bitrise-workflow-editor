import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
  applicationId: 'f4cdd4d4-095c-4be2-955c-86755f9a84e6',
  clientToken: 'pub81c6e42340ce9a297fa2692812cff51f',
  service: 'wfe',
  version: process.env.WFE_VERSION,
  trackViewsManually: true,
  sessionReplaySampleRate: 20,
  trackSessionAcrossSubdomains: true,
  sessionPersistence: 'local-storage',
  plugins: [reactPlugin()],
});

datadogRum.startView(`/app/?/workflow_editor${window.location.hash?.split('?')?.[0] || '#!/workflows'}`);

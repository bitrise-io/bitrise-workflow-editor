import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

import RuntimeUtils from '@/core/utils/RuntimeUtils';

function datadogEnv(hostname) {
  if (RuntimeUtils.isLocalMode()) return RuntimeUtils.isProduction() ? 'cli' : 'development';
  if (hostname === 'app.bitrise.io') return 'production';
  if (hostname === 'app-staging.bitrise.io' || hostname.endsWith('.services.bitrise.dev')) return 'staging';
  return 'development';
}

datadogRum.init({
  applicationId: 'f4cdd4d4-095c-4be2-955c-86755f9a84e6',
  clientToken: 'pub81c6e42340ce9a297fa2692812cff51f',
  service: 'wfe',
  env: datadogEnv(window.location.hostname),
  version: window.env.WFE_VERSION,
  trackViewsManually: true,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 5,
  trackSessionAcrossSubdomains: true,
  sessionPersistence: 'local-storage',
  plugins: [reactPlugin()],
});

datadogRum.startView(`/app/?/workflow_editor${window.location.hash?.split('?')?.[0] || '#!/workflows'}`);

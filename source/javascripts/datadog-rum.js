import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
  applicationId: 'f4cdd4d4-095c-4be2-955c-86755f9a84e6',
  clientToken: 'pub81c6e42340ce9a297fa2692812cff51f',
  site: 'datadoghq.com',
  service: 'wfe',
  version: process.env.WFE_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackViewsManually: true,
  useSecureSessionCookie: true,
  trackSessionAcrossSubdomains: true,
  usePartitionedCrossSiteSessionCookie: true,
  plugins: [reactPlugin()],
});

datadogRum.onReady(() => {
  console.debug('Datadog RUM is ready: ', datadogRum.getInternalContext());
  datadogRum.startView(window.location.hash?.split('?')?.[0]?.replace(/[#!/]/g, '') || 'workflows');
});

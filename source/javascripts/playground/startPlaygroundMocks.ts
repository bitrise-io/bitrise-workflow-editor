import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import { getBranches } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import BuildApiMocks from '@/core/api/BuildApi.mswMocks';
import { getDefaultOutputs } from '@/core/api/EnvVarsApi.mswMocks';
import LicensePoolsApiMocks from '@/core/api/LicensePoolsApi.mswMocks';
import { getCertificates, getFileStorageDocuments, getProvProfiles, getSecrets } from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import ToolCatalogApiMocks from '@/core/api/ToolCatalogApi.mswMocks';

import sampleBitriseYml from '../../../spec/integration/test_bitrise.yml?raw';

// Prototype-only: lets the design playground (the Monolith Storybook) frame this app in website mode
// with no Monolith behind it. Only loaded when the dev server runs with VITE_PLAYGROUND=true.

// The sample config pulls in local module files, which only resolve in CLI mode.
const fallbackYml = sampleBitriseYml.replace(/^include:\n(?:[ \t]+.*\n)+/m, '');

// The playground's mock database (in the Monolith, our same-origin parent) owns each project's
// config; the sample config is only a fallback for running this app without it.
type PlaygroundParent = Window & { playground?: { bitriseYml: (projectSlug: string) => string | undefined } };
const projectYml = (projectSlug: string) =>
  (window.parent as PlaygroundParent).playground?.bitriseYml(projectSlug) ?? fallbackYml;

// Saves outlive the iframe (it reloads whenever the playground navigates back to the editor), so
// they're kept in sessionStorage per project: the round trip feels real until the tab is closed.
const savedYmlKey = (projectSlug: string) => `playground:bitrise.yml:${projectSlug}`;
const savedYml = (projectSlug: string) => sessionStorage.getItem(savedYmlKey(projectSlug)) ?? projectYml(projectSlug);

const handlers = [
  http.get('/api/app/:projectSlug/config.yml', ({ params }) =>
    HttpResponse.text(savedYml(String(params.projectSlug)), { headers: { 'Bitrise-Config-Version': '1' } }),
  ),
  http.post('/api/app/:projectSlug/config.yml', async ({ params, request }) => {
    const body = (await request.json()) as { app_config_datastore_yaml?: string };
    if (body.app_config_datastore_yaml) {
      sessionStorage.setItem(savedYmlKey(String(params.projectSlug)), body.app_config_datastore_yaml);
    }
    return HttpResponse.json({}, { headers: { 'Bitrise-Config-Version': '1' } });
  }),
  http.get('/app/:projectSlug/pipeline_config', ({ params }) =>
    HttpResponse.json({
      last_modified: null,
      lines: savedYml(String(params.projectSlug)).split('\n').length,
      split: false,
      uses_repository_yml: false,
      modular_yaml_supported: false,
      yml_root_path: null,
    }),
  ),
  getBranches(),
  getSecrets(),
  getProvProfiles(),
  getCertificates(),
  getFileStorageDocuments(),
  getStacksAndMachines(),
  getDefaultOutputs(':appSlug'),
  StepApiMocks.getLocalStep({ status: 'success' }),
  LicensePoolsApiMocks.getWorkspaceLicensePools(),
  ToolCatalogApiMocks.getToolCatalog(),
  ToolCatalogApiMocks.getToolVersions(),
  BuildApiMocks.startBuild(),
];

const startPlaygroundMocks = async () => {
  const worker = setupWorker(...handlers);
  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      options: { scope: import.meta.env.BASE_URL },
    },
    // Step search (Algolia) and anything else not listed goes to the real network.
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
};

export default startPlaygroundMocks;

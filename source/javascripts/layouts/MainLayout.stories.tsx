import { Meta, StoryObj } from '@storybook/react-vite';

import { LARGE_MODULAR_ROOT, MODULAR_ROOT } from '@/components/FileTreeViewer/FileTreeViewer.mocks';
import { getBranches, getCiConfig } from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog.mswMocks';
import { getDefaultOutputs } from '@/core/api/EnvVarsApi.mswMocks';
import { getCertificates, getFileStorageDocuments, getProvProfiles, getSecrets } from '@/core/api/SecretApi.mswMocks';
import { getStacksAndMachines } from '@/core/api/StacksAndMachinesApi.mswMocks';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import MainLayout from './MainLayout';

type Story = StoryObj<typeof MainLayout>;

const openPage = (path: string) => {
  window.parent.location.hash = `#!${path}`;
};

const modularConfig =
  (root = MODULAR_ROOT) =>
  () => {
    initializeModularConfig({ root, branch: 'main', commitSha: root.commitSha });
  };

export default {
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
  },
  beforeEach({ msw }) {
    msw.use(
      getBranches(),
      getCiConfig(),
      getYmlSettings(),
      StepApiMocks.getLocalStep({ status: 'success' }),
      getSecrets(),
      getCertificates(),
      getProvProfiles(),
      getStacksAndMachines(),
      getFileStorageDocuments(),
      getDefaultOutputs(':appSlug'),
    );
    openPage('/workflows');
  },
} as Meta<typeof MainLayout>;

export const SingleFileConfig: Story = {};

export const ModularConfig: Story = {
  beforeEach: modularConfig(),
};

export const ModularConfigManyModules: Story = {
  beforeEach: modularConfig(LARGE_MODULAR_ROOT),
};

export const ModularConfigYamlView: Story = {
  beforeEach: () => {
    modularConfig()();
    openPage('/yml');
  },
};

// A 758px tall browser (the 10th percentile of Workflow Editor sessions) minus the website's 48px top bar.
export const ModularConfigShortWindow: Story = {
  ...ModularConfig,
  parameters: {
    viewport: {
      options: {
        shortWindow: { name: 'Short window (1280 × 710)', styles: { width: '1280px', height: '710px' } },
      },
    },
  },
  globals: {
    viewport: { value: 'shortWindow' },
  },
};

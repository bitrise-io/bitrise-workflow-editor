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
    // Bitkit v2 bundles copies of zag's focus-visible tracker that redefine HTMLElement.prototype.focus as
    // read-only; the page's own copy, loaded later by the lazy route, then throws when it assigns to it.
    // Storybook-only: keep the property writable for this story.
    const { defineProperty } = Object;
    Object.defineProperty = (target, key, descriptor) =>
      defineProperty(
        target,
        key,
        target === HTMLElement.prototype && key === 'focus' ? { ...descriptor, writable: true } : descriptor,
      );
    // crypto.randomUUID only exists in secure contexts, so it's missing when this Storybook is opened over
    // plain HTTP (e.g. through a dev tunnel). The Workflows page needs it for the trigger dialog.
    if (!window.isSecureContext && typeof crypto.randomUUID !== 'function') {
      crypto.randomUUID = () =>
        '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
          (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
        ) as ReturnType<Crypto['randomUUID']>;
    }
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
    return () => {
      Object.defineProperty = defineProperty;
    };
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

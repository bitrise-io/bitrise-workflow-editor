import { rem } from '@bitrise/bitkit-v2';
import { Meta, StoryObj } from '@storybook/react-vite';

import { LARGE_MODULAR_ROOT, MODULAR_ROOT } from '@/components/FileTreeViewer/FileTreeViewer.mocks';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { getYmlSettings } from '@/pages/YmlPage/components/ConfigurationYmlStorage.mswMocks';

import Navigation from './Navigation';

export default {
  component: Navigation,
  args: {
    minHeight: 'auto',
    height: rem(640),
  },
  beforeEach({ msw }) {
    msw.use(getYmlSettings());
  },
} as Meta<typeof Navigation>;

type Story = StoryObj<typeof Navigation>;

export const Default: Story = {};

export const ModularConfig: Story = {
  beforeEach: () => {
    initializeModularConfig({ root: MODULAR_ROOT, branch: 'main', commitSha: MODULAR_ROOT.commitSha });
  },
};

export const ModularConfigManyModules: Story = {
  beforeEach: () => {
    initializeModularConfig({ root: LARGE_MODULAR_ROOT, branch: 'main', commitSha: LARGE_MODULAR_ROOT.commitSha });
  },
};

export const ModularConfigYamlView: Story = {
  ...ModularConfig,
  args: { hidePageNav: true },
};

import { BitkitPageSidebar, rem } from '@bitrise/bitkit-v2';
import { Meta, StoryObj } from '@storybook/react-vite';

import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import FileTreeViewer from './FileTreeViewer';
import { LARGE_MODULAR_ROOT, MODULAR_ROOT } from './FileTreeViewer.mocks';

export default {
  component: FileTreeViewer,
  beforeEach: () => {
    initializeModularConfig({ root: MODULAR_ROOT, branch: 'main', commitSha: MODULAR_ROOT.commitSha });
  },
  decorators: [
    (Story) => (
      <BitkitPageSidebar minHeight="auto" height={rem(480)} width={rem(256)} overflow="hidden">
        <BitkitPageSidebar.Body flex="0 0 auto">
          <BitkitPageSidebar.Item>Workflows</BitkitPageSidebar.Item>
        </BitkitPageSidebar.Body>
        <Story />
      </BitkitPageSidebar>
    ),
  ],
} as Meta<typeof FileTreeViewer>;

type Story = StoryObj<typeof FileTreeViewer>;

export const Default: Story = {};

export const ManyModules: Story = {
  beforeEach: () => {
    initializeModularConfig({ root: LARGE_MODULAR_ROOT, branch: 'main', commitSha: LARGE_MODULAR_ROOT.commitSha });
  },
};

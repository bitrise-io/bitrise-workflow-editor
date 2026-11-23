import { Meta, StoryObj } from '@storybook/react-vite';

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import WorkflowConfigDrawer from './WorkflowConfigDrawer';

type Story = StoryObj<typeof WorkflowConfigDrawer>;

const meta: Meta<typeof WorkflowConfigDrawer> = {
  component: WorkflowConfigDrawer,
  args: {
    isOpen: true,
    workflowId: 'wf1',
    context: 'workflow',
  },
  // The preview loads the test config in an effect, after the first render, but the env var list reads
  // the workflow on mount and throws without it. The app never mounts the drawer before the config.
  beforeEach: () => {
    bitriseYmlStore.setState({
      yml: TEST_BITRISE_YML,
      ymlDocument: YmlUtils.toDoc(YmlUtils.toYml(TEST_BITRISE_YML as never)),
    });
  },
  argTypes: {
    context: { control: 'inline-radio', options: ['workflow', 'pipeline'] },
    onClose: { type: 'function' },
    onRename: { type: 'function' },
  },
};

export default meta;

export const Default: Story = {};

// Opened from a Pipeline: Configuration adds the Pipeline Conditions card, and there is no Triggers tab.
export const InPipeline: Story = {
  args: {
    context: 'pipeline',
  },
};

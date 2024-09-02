import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import WorkflowSelector from './WorkflowSelector';

type Story = StoryObj<typeof WorkflowSelector>;

const meta: Meta<typeof WorkflowSelector> = {
  component: WorkflowSelector,
  args: {},
  argTypes: {
    onClickCreateWorkflowButton: {
      type: 'function',
    },
  },
  decorators: (Story) => withBitriseYml(MockYml, Story),
};

export const Default: Story = {};

export default meta;

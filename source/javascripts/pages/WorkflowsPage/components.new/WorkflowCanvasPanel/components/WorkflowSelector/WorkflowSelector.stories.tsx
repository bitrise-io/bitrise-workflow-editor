import { Meta, StoryObj } from '@storybook/react';
import { mockYml } from '../../../../WorkflowsPage.mocks';
import WorkflowSelector from './WorkflowSelector';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';

type Story = StoryObj<typeof WorkflowSelector>;

const meta: Meta<typeof WorkflowSelector> = {
  component: WorkflowSelector,
  args: {},
  argTypes: {
    onClickCreateWorkflowButton: {
      type: 'function',
    },
  },
  decorators: (Story) => withBitriseYml(mockYml, Story),
};

export const Default: Story = {};

export default meta;

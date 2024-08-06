import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { mockYml } from '../../../../WorkflowsPage.mocks';
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
  decorators: (Story) => withBitriseYml(mockYml, Story),
};

export const Default: Story = {};

export default meta;

import { Meta, StoryObj } from '@storybook/react';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { mockYml } from '../../pages/PipelinesPage/PipelinesPage.mocks';
import WorkflowCard from './WorkflowCard';

export default {
  component: WorkflowCard,
  args: {
    id: 'wf1',
    isCollapsable: true,
  },
  argTypes: {
    onAddStep: { type: 'function' },
    onMoveStep: { type: 'function' },
    onSelectStep: { type: 'function' },
    onEditWorkflow: { type: 'function' },
    onChainWorkflow: { type: 'function' },
    onDeleteWorkflow: { type: 'function' },
    onMoveChainedWorkflow: { type: 'function' },
    onDeleteChainedWorkflow: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(mockYml, Story),
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};

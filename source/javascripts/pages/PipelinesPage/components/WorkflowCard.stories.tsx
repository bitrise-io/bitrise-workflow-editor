import { Meta } from '@storybook/react';
import { mockYml } from '../PipelinesPage.mocks';
import WorkflowCard from './WorkflowCard';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';

export default {
  component: WorkflowCard,
  args: {
    id: 'wf1',
    isRoot: true,
    isExpanded: true,
  },
  decorators: [
    (Story) => (
      <BitriseYmlProvider yml={mockYml}>
        <Story />
      </BitriseYmlProvider>
    ),
  ],
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

export const Empty = {
  args: {
    id: 'empty',
  },
};

export const Default = {};

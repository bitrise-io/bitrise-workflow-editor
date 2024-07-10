import { Meta } from '@storybook/react';
import { mockYml } from '../PipelinesPage.mocks';
import WorkflowCard from './WorkflowCard';
import withQueryClientProvider from '@/utils/withQueryClientProvider';

export default {
  component: WorkflowCard,
  args: {
    isExpanded: false,
    id: 'wf-1',
    defaultMeta: {
      'bitrise.io': {
        stack: 'Ubuntu 22.04',
        machine_type_id: 'Standard',
      },
    },
    workflow: mockYml.workflows!.wf1,
  },
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

export const Empty = {
  args: {
    workflow: {
      steps: [],
    },
  },
};

export const Default = {};

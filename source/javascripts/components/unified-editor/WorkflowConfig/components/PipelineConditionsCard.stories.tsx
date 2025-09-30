import { Meta, StoryObj } from '@storybook/react';

import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import PipelineConditionsCard from './PipelineConditionsCard';

export default {
  component: PipelineConditionsCard,
  beforeEach: () => {
    usePipelinesPageStore.setState({
      pipelineId: 'graph-pipeline',
      workflowId: 'wf1',
    });

    return () => {
      usePipelinesPageStore.setState({
        pipelineId: '',
        workflowId: '',
      });
    };
  },
} as Meta<typeof PipelineConditionsCard>;

type Story = StoryObj<typeof PipelineConditionsCard>;

export const Default: Story = {};

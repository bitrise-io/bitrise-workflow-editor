import { Meta, StoryObj } from '@storybook/react';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { usePipelinesPageStore } from '../../../../pages/PipelinesPage/PipelinesPage.store';
import PipelineConditionsCard from './PipelineConditionsCard';

export default {
  component: PipelineConditionsCard,
  decorators: [
    (Story) => {
      return (
        <BitriseYmlProvider yml={TEST_BITRISE_YML}>
          <Story />
        </BitriseYmlProvider>
      );
    },
  ],
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

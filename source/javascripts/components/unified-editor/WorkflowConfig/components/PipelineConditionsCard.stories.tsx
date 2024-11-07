import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import { usePipelinesPageStore } from '../../../../pages/PipelinesPage/PipelinesPage.store';
import PipelineConditionsCard from './PipelineConditionsCard';

export default {
  component: PipelineConditionsCard,
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      const { setPipelineId, setWorkflowId } = usePipelinesPageStore();

      useEffect(() => {
        setPipelineId('pipeline-1');
        setWorkflowId('workflow-1');
      }, [setPipelineId, setWorkflowId]);

      return (
        <BitriseYmlProvider yml={MockYml}>
          <Story />
        </BitriseYmlProvider>
      );
    },
  ],
} as Meta<typeof PipelineConditionsCard>;

type Story = StoryObj<typeof PipelineConditionsCard>;

export const Default: Story = {};

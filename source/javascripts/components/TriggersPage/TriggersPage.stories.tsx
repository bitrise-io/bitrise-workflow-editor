import { Meta, StoryObj } from '@storybook/react';

import TriggersPage from './TriggersPage';

export default {
  component: TriggersPage,
  args: {
    pipelines: ['foo', 'bar'],
    workflows: ['foo', 'bar'],
    onTriggerMapChange: console.log,
    setDiscard: console.log,
  },
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState: StoryObj<typeof TriggersPage> = {};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {
  args: {
    triggerMap: [
      {
        push_branch: '*',
        enabled: false,
        workflow: 'foo',
      },
      {
        push_branch: 'adssaads',
        enabled: true,
        workflow: 'foo',
      },
      {
        pull_request_target_branch: '*',
        pull_request_source_branch: '*',
        workflow: 'bar',
      },
      {
        pull_request_target_branch: '123',
        pull_request_source_branch: '*',
        workflow: 'bar',
        draft_pull_request_enabled: true,
      },
    ],
  },
};

import { Meta, StoryObj } from '@storybook/react';

import { makeNotificationMetadataEndpoint } from '@/components/ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
import TriggersPage from './TriggersPage';

export default {
  component: TriggersPage,
  args: {
    integrationsUrl: '',
    isWebsiteMode: false,
    pipelines: ['foo', 'bar', 'ci-test-long-name-example-with-potential-truncat-foooooooooo-very-long'],
    workflows: ['foo', 'bar'],
    setDiscard: () => {},
  },
  argTypes: {
    onTriggerMapChange: { type: 'function' },
    setDiscard: { type: 'function' },
  },
  parameters: {
    msw: [...makeNotificationMetadataEndpoint()],
  },
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState: StoryObj<typeof TriggersPage> = {};

export const TriggersPageWithTriggerMap: StoryObj<typeof TriggersPage> = {
  args: {
    triggerMap: [
      {
        push_branch: '*',
        enabled: false,
        workflow: 'ci-test-long-name-example-with-potential-truncat-foooooooooo-very-long',
      },
      {
        push_branch:
          'ABC-1234-POC-awesomething-to-do-a-very-long-branch-name-just-for-fun-because-we-need-it-to-test-text-trruncate',
        enabled: true,
        workflow: 'foo',
      },
      {
        pull_request_target_branch: '*',
        pull_request_source_branch: '*',
        pipeline: 'bar',
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

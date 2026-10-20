import { Meta, StoryObj } from '@storybook/react-vite';
import { stringify } from 'yaml';

import YmlUtils from '@/core/utils/YmlUtils';

import WithGroupDrawer from './WithGroupDrawer';

// The shared test yml has no `with` group, so this story adds a workflow that starts with one. It
// builds a copy rather than mutating TEST_BITRISE_YML, which every other story reads too.
const yml = {
  ...TEST_BITRISE_YML,
  workflows: {
    ...TEST_BITRISE_YML.workflows,
    'with-group': {
      steps: [
        {
          with: {
            container: 'golang:1.22',
            services: ['redis:latest', 'postgres:16'],
            steps: [{ 'script@1': {} }],
          },
        },
      ],
    },
  },
};

export default {
  title: 'javascripts/components/unified-editor/WithGroup',
  component: WithGroupDrawer,
  args: {
    isOpen: true,
    workflowId: 'with-group',
    stepIndex: 0,
  },
  parameters: {
    bitriseYmlStore: { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) },
  },
} as Meta<typeof WithGroupDrawer>;

export const Drawer: StoryObj<typeof WithGroupDrawer> = {};

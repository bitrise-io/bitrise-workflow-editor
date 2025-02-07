import { set } from 'es-toolkit/compat';
import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import CreatePipelineDialog from './CreatePipelineDialog';

export default {
  component: CreatePipelineDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onCreatePipeline: { type: 'function' },
  },
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-create-graph-pipeline-based-on-staged-pipeline', false);
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof CreatePipelineDialog>;

export const Default: StoryObj = {};

export const ConversionEnabled: StoryObj = {
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-create-graph-pipeline-based-on-staged-pipeline', true);
  },
};

import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import Toolbar from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  argTypes: {
    onRunClick: { type: 'function' },
    onWorkflowsClick: { type: 'function' },
    onPropertiesClick: { type: 'function' },
  },
  decorators: [(Story) => withBitriseYml(TEST_BITRISE_YML, Story)],
};

export const Default: Story = {};

export default meta;

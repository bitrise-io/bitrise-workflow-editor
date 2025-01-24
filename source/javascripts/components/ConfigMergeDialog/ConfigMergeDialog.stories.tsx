import { Meta, StoryObj } from '@storybook/react';

import ConfigMergeDialog from './ConfigMergeDialog';

type Story = StoryObj<typeof ConfigMergeDialog>;

const meta: Meta<typeof ConfigMergeDialog> = {
  component: ConfigMergeDialog,
  argTypes: {
    onSave: {
      type: 'function',
    },
    onClose: {
      type: 'function',
    },
  },
};

export const Default: Story = {};

export default meta;

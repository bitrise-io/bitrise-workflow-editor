import { Meta, StoryObj } from '@storybook/react';

import ConfigMergeDialog from './ConfigMergeDialog';
import { configMergeDialog } from './ConfigMergeDialog.store';
import { baseYaml, remoteYaml, yourYaml } from './ConfigMergeDialog.mocks';

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
  beforeEach: () => {
    configMergeDialog.setState({
      isOpen: true,
      isLoading: false,
      baseYaml,
      yourYaml,
      remoteYaml,
      errorMessage: '',
    });
  },
};

export const Default: Story = {};

export const WithError: Story = {
  beforeEach: () => {
    configMergeDialog.setState({
      errorMessage: 'An error occurred',
    });
  },
};

export default meta;

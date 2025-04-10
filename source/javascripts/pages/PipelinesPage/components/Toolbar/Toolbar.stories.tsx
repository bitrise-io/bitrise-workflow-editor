import { Meta, StoryObj } from '@storybook/react';
import Toolbar from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  argTypes: {
    onCreatePipelineClick: { type: 'function' },
    onRunClick: { type: 'function' },
    onWorkflowsClick: { type: 'function' },
    onPropertiesClick: { type: 'function' },
  },
};

export const Default: Story = {};

export default meta;

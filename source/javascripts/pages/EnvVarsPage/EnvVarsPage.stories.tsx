import { Meta, StoryObj } from '@storybook/react';
import EnvVarsPage from './EnvVarsPage';

type Story = StoryObj<typeof EnvVarsPage>;

const meta: Meta<typeof EnvVarsPage> = {
  component: EnvVarsPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: Story = {};

export default meta;

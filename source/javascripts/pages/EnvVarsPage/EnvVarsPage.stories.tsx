import { Meta, StoryObj } from '@storybook/react';
import EnvVarsPage from './EnvVarsPage';

type Story = StoryObj<typeof EnvVarsPage>;

const meta: Meta<typeof EnvVarsPage> = {
  component: EnvVarsPage,
  args: {
    yml: TEST_BITRISE_YML,
  },
  argTypes: {
    onChange: { type: 'function' },
  },
};

export const Default: Story = {};

export default meta;

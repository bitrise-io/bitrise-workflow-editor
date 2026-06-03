import { Meta, StoryObj } from '@storybook/react-vite';

import AddStepButton from './AddStepButton';

type Story = StoryObj<typeof AddStepButton>;

const meta: Meta<typeof AddStepButton> = {
  component: AddStepButton,
};

export default meta;

export const Default: Story = {};

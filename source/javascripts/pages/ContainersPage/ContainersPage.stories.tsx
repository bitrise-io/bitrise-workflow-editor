import { Meta, StoryObj } from '@storybook/react-vite';

import ContainersPage from './ContainersPage';

type Story = StoryObj<typeof ContainersPage>;

const meta: Meta<typeof ContainersPage> = {
  component: ContainersPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: Story = {};

export default meta;

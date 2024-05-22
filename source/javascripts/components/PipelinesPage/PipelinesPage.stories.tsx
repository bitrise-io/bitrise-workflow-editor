import { Meta, StoryObj } from '@storybook/react';
import PipelinesPage from './PipelinesPage';
import { mockYml } from './PipelinesPage.mocks';

export default {
  component: PipelinesPage,
  args: { yml: mockYml },
} as Meta<typeof PipelinesPage>;

type Story = StoryObj<typeof PipelinesPage>;

export const Default: Story = {};

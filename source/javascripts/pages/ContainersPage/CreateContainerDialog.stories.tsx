import { Meta, StoryObj } from '@storybook/react-vite';

import CreateContainerDialog from '@/pages/ContainersPage/CreateContainerDialog';

type Story = StoryObj<typeof CreateContainerDialog>;

const meta: Meta<typeof CreateContainerDialog> = {
  component: CreateContainerDialog,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: Story = {
  render: (args) => <CreateContainerDialog {...args} isOpen={true} onClose={() => {}} />,
};

export default meta;

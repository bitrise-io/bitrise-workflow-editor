import { Meta, StoryObj } from '@storybook/react-vite';

import DeleteContainerDialog from '@/pages/ContainersPage/DeleteContainerDialog';

type Story = StoryObj<typeof DeleteContainerDialog>;

const meta: Meta<typeof DeleteContainerDialog> = {
  component: DeleteContainerDialog,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: Story = {
  render: (args) => <DeleteContainerDialog {...args} isOpen={true} onClose={() => {}} />,
};

export default meta;

import { Meta, StoryObj } from '@storybook/react-webpack5';

import EditableInput from './EditableInput';

type Story = StoryObj<typeof EditableInput>;

const meta: Meta<typeof EditableInput> = {
  component: EditableInput,
  argTypes: {
    onCommit: { type: 'function' },
  },
};

export const Default: Story = {};

export default meta;

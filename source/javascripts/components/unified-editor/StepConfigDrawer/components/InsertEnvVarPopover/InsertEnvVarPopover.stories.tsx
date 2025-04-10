import { Meta, StoryObj } from '@storybook/react';
import { Mode } from '../../hooks/useMultiModePopover';
import InsertEnvVarPopover from './InsertEnvVarPopover';

export default {
  component: InsertEnvVarPopover,
  args: {
    size: 'sm',
    isOpen: true,
    mode: Mode.SELECT,
    isLoading: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'], type: 'string' },
    mode: {
      control: 'inline-radio',
      options: [Mode.SELECT, Mode.CREATE],
      type: 'string',
    },
    isOpen: { control: 'boolean', type: 'boolean' },
    isLoading: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function', action: 'onOpen' },
    onCreate: { type: 'function', action: 'onCreate' },
    onSelect: { type: 'function', action: 'onSelect' },
  },
} as Meta<typeof InsertEnvVarPopover>;

export const Select: StoryObj<typeof InsertEnvVarPopover> = {};

export const Create: StoryObj<typeof InsertEnvVarPopover> = {
  args: {
    ...Select.args,
    mode: Mode.CREATE,
  },
};

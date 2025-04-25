import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { Mode } from '@/components/VariablePopover/hooks/useMultiModePopover';
import EnvVarPopover from './EnvVarPopover';

export default {
  component: EnvVarPopover,
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
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof EnvVarPopover>;

export const Select: StoryObj<typeof EnvVarPopover> = {};

export const Create: StoryObj<typeof EnvVarPopover> = {
  args: {
    ...Select.args,
    mode: Mode.CREATE,
  },
};

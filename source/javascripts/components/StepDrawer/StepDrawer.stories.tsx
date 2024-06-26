import { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '@bitrise/bitkit';
import StepDrawer from './StepDrawer';
import { error, successful } from './hooks/StepDrawer.mswMocks';

export default {
  component: StepDrawer,
  argTypes: {
    defaultIsOpen: { control: 'boolean', type: 'boolean' },
    isOpen: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function' },
    onClose: { type: 'function' },
    onStepSelected: { type: 'function' },
  },
  args: {
    defaultIsOpen: true,
  },
  parameters: {
    msw: {
      handlers: [successful],
    },
  },
} as Meta<typeof StepDrawer>;

export const Uncontrolled: StoryObj = {};

export const Controlled: StoryObj = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isOpen, onOpen, onClose } = useDisclosure({
        defaultIsOpen: true,
      });

      return <Story isOpen={isOpen} onOpen={onOpen} onClose={onClose} />;
    },
  ],
};

export const Error: StoryObj = {
  parameters: {
    msw: {
      handlers: [error],
    },
  },
};

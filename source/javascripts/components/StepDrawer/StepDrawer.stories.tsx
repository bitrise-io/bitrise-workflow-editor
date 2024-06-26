import { Meta, StoryObj } from '@storybook/react';
import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import StepDrawer from './StepDrawer';

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
} as Meta<typeof StepDrawer>;

export const Uncontrolled: StoryObj = {};

export const Controlled: StoryObj = {
  decorators: [
    (Story) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isOpen, onOpen, onClose } = useDisclosure({
        defaultIsOpen: true,
      });

      return (
        <Box>
          <Button onClick={onOpen}>Open</Button>
          <Story isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
        </Box>
      );
    },
  ],
};

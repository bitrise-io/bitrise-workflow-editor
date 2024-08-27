import { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '@bitrise/bitkit';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import StepSelectorDrawer from './StepSelectorDrawer';

export default {
  component: StepSelectorDrawer,
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
      handlers: [StepApiMocks.getAlgoliaSteps({ status: 'success' })],
    },
  },
} as Meta<typeof StepSelectorDrawer>;

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
      handlers: [StepApiMocks.getAlgoliaSteps({ status: 'error' })],
    },
  },
};

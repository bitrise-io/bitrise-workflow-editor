import { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '@bitrise/bitkit';
import ChainWorkflowDrawer from './ChainWorkflowDrawer';
import { mockYml } from './ChainWorkflowDrawer.mocks';

export default {
  component: ChainWorkflowDrawer,
  args: {
    id: 'wf-1',
    yml: mockYml,
    defaultIsOpen: true,
  },
  argTypes: {
    id: { type: 'string' },
    defaultIsOpen: { control: 'boolean', type: 'boolean' },
    isOpen: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function' },
    onClose: { type: 'function' },
    onChainBefore: { type: 'function' },
    onChainAfter: { type: 'function' },
  },
} as Meta<typeof ChainWorkflowDrawer>;

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

export const Empty: StoryObj = {
  args: {
    yml: {
      workflows: {},
    },
  },
};

export const LoopFiltered: StoryObj = {
  args: {
    id: 'setup',
  },
};

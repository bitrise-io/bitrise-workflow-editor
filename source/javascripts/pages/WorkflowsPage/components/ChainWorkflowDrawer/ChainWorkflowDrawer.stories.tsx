import { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '@bitrise/bitkit';
import ChainWorkflowDrawer from './ChainWorkflowDrawer';
import { mockYml } from './ChainWorkflowDrawer.mocks';

export default {
  component: ChainWorkflowDrawer,
  args: {
    yml: mockYml,
    workflowId: 'wf-1',
    defaultIsOpen: true,
  },
  argTypes: {
    workflowId: { type: 'string' },
    defaultIsOpen: { control: 'boolean', type: 'boolean' },
    isOpen: { control: 'boolean', type: 'boolean' },
    onOpen: { type: 'function' },
    onClose: { type: 'function' },
    onChainBefore: { type: 'function' },
    onChainAfter: { type: 'function' },
  },
} as Meta<typeof ChainWorkflowDrawer>;

export const Default: StoryObj = {
  args: {
    workflowId: 'wf-1',
  },
};

export const Empty: StoryObj = {
  args: {
    yml: {
      workflows: {},
    },
  },
};

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

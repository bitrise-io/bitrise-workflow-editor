import { Meta, StoryObj } from '@storybook/react';
import { useDisclosure } from '@bitrise/bitkit';
import { ChainableMockYml } from '@/core/models/BitriseYml.mocks';
import ChainWorkflowDrawer from './ChainWorkflowDrawer';

export default {
  component: ChainWorkflowDrawer,
  args: {
    defaultIsOpen: true,
    workflowId: 'wf-1',
    yml: ChainableMockYml,
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

export const Default: StoryObj = {};

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

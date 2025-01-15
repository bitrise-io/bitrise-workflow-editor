import { Meta, StoryObj } from '@storybook/react';
import { Box, Button, useDisclosure } from '@bitrise/bitkit';

import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import ConfigMergeDialog from './ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from './ConfigMergeDialog.mocks';

type Story = StoryObj<typeof ConfigMergeDialog>;

const meta: Meta<typeof ConfigMergeDialog> = {
  component: ConfigMergeDialog,
  args: {
    isOpen: true,
    baseYaml,
    yourYaml,
    remoteYaml,
  },
  argTypes: {
    onClose: {
      type: 'function',
    },
    onSave: {
      type: 'function',
    },
  },
  render: ({ isOpen: defaultIsOpen, onClose: defaultOnClose, ...args }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen, onClose: defaultOnClose });

    return (
      <BitriseYmlProvider yml={TEST_BITRISE_YML}>
        <Box display="flex" justifyContent="center" alignItems="center" height="90dvh">
          <Button onClick={onOpen}>Open dialog</Button>
        </Box>
        <ConfigMergeDialog {...args} isOpen={isOpen} onClose={onClose} />
      </BitriseYmlProvider>
    );
  },
};

export const Default: Story = {};

export default meta;

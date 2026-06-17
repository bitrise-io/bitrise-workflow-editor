import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';

import MergedDiffDialog from '@/components/DiffEditor/MergedDiffDialog';

type Story = StoryObj<typeof MergedDiffDialog>;

const SAVED_MERGED_YML =
  'format_version: "13"\n' +
  'workflows:\n' +
  '  build:\n' +
  '    steps:\n' +
  '    - script@1:\n' +
  '        inputs:\n' +
  '        - content: echo "build"\n';

const MERGED_YML =
  'format_version: "13"\n' +
  'workflows:\n' +
  '  build:\n' +
  '    steps:\n' +
  '    - script@1:\n' +
  '        inputs:\n' +
  '        - content: echo "build and test"\n' +
  '  deploy:\n' +
  '    steps:\n' +
  '    - script@1:\n' +
  '        inputs:\n' +
  '        - content: echo "deploy"\n';

const meta: Meta<typeof MergedDiffDialog> = {
  component: MergedDiffDialog,
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { type: 'function' },
  },
  parameters: {
    bitriseYmlStore: {
      savedMergedYml: SAVED_MERGED_YML,
      mergedYml: MERGED_YML,
    },
  },
  render: (args) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <Box padding="25">
        <Button onClick={onOpen}>Open Dialog</Button>
        <MergedDiffDialog {...args} isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  },
};

export default meta;

export const Default: Story = {};

export const NoChanges: Story = {
  parameters: {
    bitriseYmlStore: {
      savedMergedYml: SAVED_MERGED_YML,
      mergedYml: SAVED_MERGED_YML,
    },
  },
};

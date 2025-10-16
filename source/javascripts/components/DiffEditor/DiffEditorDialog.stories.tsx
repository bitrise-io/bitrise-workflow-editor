import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-webpack5';

import DiffEditorDialog from '@/components/DiffEditor/DiffEditorDialog';

type Story = StoryObj<typeof DiffEditorDialog>;

const meta: Meta<typeof DiffEditorDialog> = {
  component: DiffEditorDialog,
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { type: 'function' },
  },
  parameters: {
    bitriseYmlStore: {
      ymlString:
        'app:\n' +
        '  envs:\n' +
        '  - ACCESS_KEY: "120"\n' +
        '  - GITHUB_TOKEN: GITHUB_TOKEN\n' +
        '    opts:\n' +
        '      is_expand: false\n' +
        '  - SLACK_WEBHOOK: https://tempuri.org',
      savedYmlString:
        'app:\n' +
        '  envs:\n' +
        '  - ACCESS_KEY: "125"\n' +
        '  - GITHUB_TOKEN: GITHUB_TOKEN\n' +
        '    opts:\n' +
        '      is_expand: false\n' +
        '  - SLACK_WEBHOOK: https://tempuri.org',
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <Box padding="25">
        <Button onClick={onOpen}>Open Dialog</Button>
        <DiffEditorDialog {...args} isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  },
};

export default meta;

export const Default: Story = {};

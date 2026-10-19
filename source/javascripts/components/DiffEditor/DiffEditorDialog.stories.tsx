import { Box } from '@bitrise/bitkit';
import { BitkitButton } from '@bitrise/bitkit-v2';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Meta, StoryObj } from '@storybook/react-vite';

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
    const { open: isOpen, onOpen, onClose } = useDisclosure();

    return (
      <Box padding="25">
        <BitkitButton onClick={onOpen}>Open Dialog</BitkitButton>
        <DiffEditorDialog {...args} isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  },
};

export default meta;

export const Default: Story = {};

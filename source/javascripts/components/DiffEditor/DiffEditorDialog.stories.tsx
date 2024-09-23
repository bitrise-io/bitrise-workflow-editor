import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import DiffEditorDialog from '@/components/DiffEditor/DiffEditorDialog';

export default {
  component: DiffEditorDialog,
  args: {
    originalText:
      'app:\n' +
      '  envs:\n' +
      '  - ACCESS_KEY: "120"\n' +
      '  - GITHUB_TOKEN: GITHUB_TOKEN\n' +
      '    opts:\n' +
      '      is_expand: false\n' +
      '  - SLACK_WEBHOOK: https://tempuri.org',
    modifiedText:
      'app:\n' +
      '  envs:\n' +
      '  - ACCESS_KEY: "90"\n' +
      '  - GITHUB_TOKEN: GITHUB_TOKEN\n' +
      '  - SLACK_WEBHOOK: https://tempuri.org',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    originalText: { control: 'text' },
    modifiedText: { control: 'text' },
    onChange: { action: 'onChange' },
  },
  render: (args: any) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <Box padding="25">
        <Button onClick={onOpen}>Open Dialog</Button>
        <DiffEditorDialog {...args} isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  },
};

export const Default = {};

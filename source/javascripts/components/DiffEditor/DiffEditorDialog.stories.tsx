import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';

import DiffEditorDialog from '@/components/DiffEditor/DiffEditorDialog';
import { FileSlice } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

type Story = StoryObj<typeof DiffEditorDialog>;

// A session-created file: editable with an empty commitSha → no saved baseline,
// so the dialog renders a plain code view instead of a two-sided diff (isNewFile === true).
const NEW_FILE_CONTENT = 'workflows:\n  build:\n    steps:\n    - script@1: {}\n';
const NEW_FILE_NODE_ID = 'n_new_file';
const newFileSlice: FileSlice = {
  nodeId: NEW_FILE_NODE_ID,
  path: 'modules/new.yml',
  source: { path: 'modules/new.yml', repository: null, branch: null, tag: null, commit: null },
  commitSha: '',
  editable: true,
  ymlDocument: YmlUtils.toDoc(NEW_FILE_CONTENT),
  savedYmlDocument: YmlUtils.toDoc(NEW_FILE_CONTENT),
};

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

export const NewFile: Story = {
  parameters: {
    bitriseYmlStore: {
      selectedNodeId: NEW_FILE_NODE_ID,
      files: { [NEW_FILE_NODE_ID]: newFileSlice },
      ymlDocument: YmlUtils.toDoc(NEW_FILE_CONTENT),
      savedYmlDocument: YmlUtils.toDoc(NEW_FILE_CONTENT),
    },
  },
};

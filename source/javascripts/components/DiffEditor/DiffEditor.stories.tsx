import { Box } from '@bitrise/bitkit';
import DiffEditor from './DiffEditor';

export default {
  component: DiffEditor,
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
    originalText: { control: 'text' },
    modifiedText: { control: 'text' },
    onChange: { action: 'onChange' },
  },
  render: (args: any) => (
    <Box h="500px">
      <DiffEditor {...args} />
    </Box>
  ),
};

export const Default = {};

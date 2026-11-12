import { Meta, StoryObj } from '@storybook/react-vite';

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import WorkflowConfigProvider from '../WorkflowConfigProvider';
import EnvVarsCard from './EnvVarsCard';

const storeWith = (contents: string) => {
  const doc = YmlUtils.toDoc(contents);
  return {
    tree: undefined,
    files: {},
    selectedNodeId: undefined,
    ymlDocument: doc,
    savedYmlDocument: doc,
    yml: YmlUtils.toJSON(doc),
  };
};

const VALID_STORE = storeWith(
  ['workflows:', '  primary:', '    envs:', '    - API_URL: https://example.com', '    - RETRIES: "3"', ''].join('\n'),
);

const INVALID_STORE = storeWith(
  [
    'workflows:',
    '  primary:',
    '    envs:',
    '    - API_URL: https://example.com',
    '    - 1_STARTS_WITH_DIGIT: one',
    '    - HAS-DASH: two',
    '',
  ].join('\n'),
);

/**
 * The Env Vars card on a workflow's Configuration tab. The env var list seeds itself once on mount,
 * so each story also sets the store before rendering, not only through the `bitriseYmlStore` parameter.
 */
const meta: Meta<typeof EnvVarsCard> = {
  component: EnvVarsCard,
  decorators: [
    (Story) => (
      <WorkflowConfigProvider workflowId="primary">
        <Story />
      </WorkflowConfigProvider>
    ),
  ],
  parameters: {
    bitriseYmlStore: VALID_STORE,
  },
  beforeEach: ({ parameters }) => {
    bitriseYmlStore.setState(parameters.bitriseYmlStore);
  },
};

export default meta;

type Story = StoryObj<typeof EnvVarsCard>;

export const Default: Story = {};

/** Keys that fail validation are counted in a red badge at the trailing end of the header, next to the chevron. */
export const WithValidationErrors: Story = {
  parameters: {
    bitriseYmlStore: INVALID_STORE,
  },
};

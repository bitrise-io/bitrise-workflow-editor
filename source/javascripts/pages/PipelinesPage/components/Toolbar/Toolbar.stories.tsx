import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import { aiButtonDisabled, aiButtonEnabled } from '@/storyutils/getAISettings.utils';

import Toolbar from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-ci-config-expert-agent', true);
  },
  argTypes: {
    onCreatePipelineClick: { type: 'function' },
    onRunClick: { type: 'function' },
    onWorkflowsClick: { type: 'function' },
    onPropertiesClick: { type: 'function' },
  },
};

export const Default: Story = {};

export const WithCreateWithAIButton: StoryObj = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
  },
};

export const WithCreateWithAIButtonDisabled: StoryObj = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonDisabled();
  },
};

export default meta;

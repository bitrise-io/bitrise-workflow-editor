import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';

import { aiButtonDisabled, aiButtonEnabled } from '@/components/unified-editor/AIButton';

import CreateFirstGraphPipelineEmptyState from './CreateFirstGraphPipelineEmptyState';

export default {
  component: CreateFirstGraphPipelineEmptyState,
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-ci-config-expert-agent', true);
  },
} as Meta<typeof CreateFirstGraphPipelineEmptyState>;

export const CreateFirstGraphPipelineWithoutCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {};

export const CreateFirstGraphPipelineWithCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
  },
};

export const CreateFirstGraphPipelineWithCreateWithAIDisabled: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonDisabled();
  },
};

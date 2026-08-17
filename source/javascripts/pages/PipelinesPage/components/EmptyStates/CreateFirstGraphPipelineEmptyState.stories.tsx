import { Meta, StoryObj } from '@storybook/react-vite';

import { aiButtonDisabled, aiButtonEnabled } from '@/storyutils/getAISettings.utils';

import CreateFirstGraphPipelineEmptyState from './CreateFirstGraphPipelineEmptyState';

export default {
  component: CreateFirstGraphPipelineEmptyState,
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

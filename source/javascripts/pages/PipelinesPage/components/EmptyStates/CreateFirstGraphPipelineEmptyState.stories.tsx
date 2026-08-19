import { Meta, StoryObj } from '@storybook/react-vite';

import { aiButtonEnabled, aiButtonUnavailable } from '@/storyutils/getAISettings.utils';

import CreateFirstGraphPipelineEmptyState from './CreateFirstGraphPipelineEmptyState';

export default {
  component: CreateFirstGraphPipelineEmptyState,
} as Meta<typeof CreateFirstGraphPipelineEmptyState>;

export const CreateFirstGraphPipelineWithoutCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonUnavailable();
  },
};

export const CreateFirstGraphPipelineWithCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
  },
};

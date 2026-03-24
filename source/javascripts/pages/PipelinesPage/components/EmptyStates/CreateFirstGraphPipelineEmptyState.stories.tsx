import { Meta, StoryObj } from '@storybook/react-vite';

import CreateFirstGraphPipelineEmptyState from './CreateFirstGraphPipelineEmptyState';

export default {
  component: CreateFirstGraphPipelineEmptyState,
} as Meta<typeof CreateFirstGraphPipelineEmptyState>;

export const CreateFirstGraphPipelineWithoutCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {};

export const CreateFirstGraphPipelineWithCreateWithAI: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      settings: {
        ai: {
          ciConfigExpert: {
            options: { wfeIntegration: true },
          },
          failedBuilds: {
            disabled: 'by-project',
            options: undefined,
          },
          fixer: {
            disabled: 'by-project',
            options: undefined,
          },
        },
      },
    };
  },
};

export const CreateFirstGraphPipelineWithCreateWithAIDisabled: StoryObj<typeof CreateFirstGraphPipelineEmptyState> = {
  beforeEach: () => {
    window.parent.pageProps = {
      ...window.parent.pageProps,
      settings: {
        ai: {
          ciConfigExpert: {
            disabled: 'by-project',
            options: undefined,
          },
          failedBuilds: {
            disabled: 'by-project',
            options: undefined,
          },
          fixer: {
            disabled: 'by-project',
            options: undefined,
          },
        },
      },
    };
  },
};

import { Meta, StoryObj } from '@storybook/react-vite';

import Toolbar from './Toolbar';

type Story = StoryObj<typeof Toolbar>;

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
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

export const WithCreateWithAIButtonDisabled: StoryObj = {
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

export default meta;

import { Meta, StoryObj } from '@storybook/react-vite';

import StepBundleConfigDrawer from './StepBundleConfigDrawer';

export default {
  title: 'javascripts/components/unified-editor/StepBundle',
  component: StepBundleConfigDrawer,
  args: {
    isOpen: true,
    parentWorkflowId: 'wf7',
    stepIndex: 2,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
} as Meta<typeof StepBundleConfigDrawer>;

export const Drawer: StoryObj<typeof StepBundleConfigDrawer> = {};

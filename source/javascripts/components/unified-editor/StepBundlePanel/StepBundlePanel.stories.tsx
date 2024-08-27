import { Meta, StoryObj } from '@storybook/react';
import StepBundlePanel from './StepBundlePanel';

export default {
  component: StepBundlePanel,
} as Meta<typeof StepBundlePanel>;

export const StepBundle: StoryObj<typeof StepBundlePanel> = {
  args: {
    stepDisplayName: 'Step bundle: install_deps',
  },
};

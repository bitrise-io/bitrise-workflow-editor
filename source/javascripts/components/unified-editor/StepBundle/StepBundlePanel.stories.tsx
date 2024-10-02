import { Meta, StoryObj } from '@storybook/react';
import StepBundlePanel from './StepBundlePanel';

export default {
  title: 'javascripts/components/unified-editor/StepBundle',
  component: StepBundlePanel,
  args: {
    bundleName: 'Step bundle: install_deps',
  },
} as Meta<typeof StepBundlePanel>;

export const Panel: StoryObj<typeof StepBundlePanel> = {};

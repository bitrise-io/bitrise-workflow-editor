import { Meta, StoryObj } from '@storybook/react/*';
import { Step } from '../../../../models';
import StepBundlePanel from './StepBundlePanel';

const mockStep: Step = {
  $$hashKey: 'unique-key',
  id: 'test-step-id',
  cvs: 'test-cvs',
  version: '1.0.0',
  defaultStepConfig: {
    version: '1.0.0',
    source_code_url: 'https://example.com/source-code',
    inputs: [
      { key: 'input1', value: 'value1' },
      { key: 'input2', value: 'value2' },
    ],
  },
  displayName: () => 'Test Step Display Name',
  displayTooltip: () => 'Tooltip for Test Step',
  title: (value?: string) => value || 'Test Step Title',
  summary: (value?: string) => value || 'Test Step Summary',
  description: (value?: string) => value || 'Test Step Description',
  sourceURL: (value?: string) => value || 'https://example.com/source-code',
  iconURL: (value?: string) => value || 'https://example.com/icon.png',
  runIf: (value?: string) => value || 'true',
  isAlwaysRun: (value?: boolean) => (value !== undefined ? value : true),
  isConfigured: () => true,
  isVerified: () => true,
  isOfficial: () => true,
  isDeprecated: () => false,
  isLibraryStep: () => false,
  isVCSStep: () => false,
  requestedVersion: () => null,
};

export default {
  component: StepBundlePanel,
} as Meta<typeof StepBundlePanel>;

export const StepBundle: StoryObj = {
  args: {
    step: mockStep,
  },
};

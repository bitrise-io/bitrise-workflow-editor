import { Meta } from '@storybook/react';
import BuildApiMocks from '@/core/api/BuildApi.mswMocks';
import RunWorkflowDialog from './RunWorkflowDialog';

export default {
  component: RunWorkflowDialog,
  args: {
    isOpen: true,
    workflowId: 'primary-workflow',
  },
  argTypes: {
    workflowId: { type: 'string' },
    isOpen: { type: 'boolean', control: { type: 'boolean' } },
    onClose: { type: 'function' },
  },
} as Meta<typeof RunWorkflowDialog>;

export const Default = {
  parameters: {
    msw: [BuildApiMocks.startBuild('success')],
  },
};

export const Error = {
  parameters: {
    msw: [BuildApiMocks.startBuild('error')],
  },
};

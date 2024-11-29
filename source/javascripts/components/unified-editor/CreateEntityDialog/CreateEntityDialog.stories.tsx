import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import CreateEntityDialog from './CreateEntityDialog';

export default {
  component: CreateEntityDialog,
  args: {
    baseEntityIds: ['entity 1', 'entity 2', 'entity 3'],
    entityName: 'Entity',
    isOpen: true,
    sanitizer: (value) => value,
    validator: (value) => (value ? true : 'This is required'),
  },
  argTypes: {
    onClose: { type: 'function' },
    onCloseComplete: { type: 'function' },
    onCreateEntity: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof CreateEntityDialog>;

export const Default: StoryObj = {};

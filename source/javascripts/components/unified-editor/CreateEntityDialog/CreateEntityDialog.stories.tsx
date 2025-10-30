import { Meta, StoryObj } from '@storybook/react-webpack5';

import CreateEntityDialog from './CreateEntityDialog';

export default {
  component: CreateEntityDialog,
  args: {
    entityName: 'Entity',
    isOpen: true,
    sanitizer: (value) => value,
    validator: (value) => (value ? true : 'This is required'),
    withTitle: false,
  },
  argTypes: {
    onClose: { type: 'function' },
    onCloseComplete: { type: 'function' },
    onCreateEntity: { type: 'function' },
  },
} as Meta<typeof CreateEntityDialog>;

export const Default: StoryObj = {
  args: {
    baseEntities: [{ ids: ['entity 1', 'entity 2', 'entity 3'] }],
  },
};

export const WithGroups: StoryObj = {
  args: {
    baseEntities: [
      {
        ids: ['entity 1', 'entity 2', 'entity 3'],
        groupLabel: 'Step bundles',
        type: 'step_bundle',
      },
      {
        ids: ['_entity 1', '_entity 2', '_entity 3'],
        groupLabel: 'Utility workflows',
        type: 'utility_workflow',
      },
    ],
  },
};

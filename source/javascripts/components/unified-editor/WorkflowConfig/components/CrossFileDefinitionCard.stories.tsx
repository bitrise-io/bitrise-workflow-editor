import { Meta, StoryObj } from '@storybook/react-vite';

import CrossFileDefinitionCard from './CrossFileDefinitionCard';

/**
 * Stands in for the Stack & Machine and Env Vars cards on the Configuration tab when the workflow is
 * defined in another file of an `include:` tree. It only says where to edit them, so it is a plain card.
 */
export default {
  component: CrossFileDefinitionCard,
  args: {
    title: 'Env Vars',
    definingPath: 'ci/workflows.yml',
  },
} as Meta<typeof CrossFileDefinitionCard>;

type Story = StoryObj<typeof CrossFileDefinitionCard>;

export const Default: Story = {};

/** Without a known path the card falls back to "another file". */
export const UnknownFile: Story = {
  args: {
    definingPath: undefined,
  },
};

export const StackAndMachine: Story = {
  args: {
    title: 'Stack & Machine',
  },
};

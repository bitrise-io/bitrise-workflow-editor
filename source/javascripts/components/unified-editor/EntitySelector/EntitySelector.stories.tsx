import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { useState } from 'react';

import { aiButtonDisabled, aiButtonEnabled } from '@/components/unified-editor/AIButton.mswMocks';

import EntitySelector, { EntitySelectorProps } from './EntitySelector';

const meta: Meta<EntitySelectorProps> = {
  component: EntitySelector,
  beforeEach: () => {
    set(window, 'parent.globalProps.featureFlags.account.enable-ci-config-expert-agent', true);
  },
  args: {
    entityIds: [
      'Spongebob',
      'Squidward',
      'Sandy',
      'Patrick',
      'Mr. Krabs',
      'Plankton',
      'Gary',
      'Pearl',
      'Krusty Krab',
      'Chum Bucket',
    ],
    entityName: 'Workflow',
    onCreate: () => {},
  },
  argTypes: {
    entityName: {
      control: 'inline-radio',
      options: ['Workflow', 'Step bundle'],
      type: 'string',
    },
  },
};

export default meta;

const StoryComponent = (props: EntitySelectorProps) => {
  const [value, setValue] = useState<string | undefined>(props.entityIds[0]);
  return <EntitySelector {...props} onChange={setValue} value={value || undefined} />;
};

export const WithProps = {
  render: StoryComponent,
};

export const WithSecondaryList: StoryObj<EntitySelectorProps> = {
  args: {
    secondaryEntities: {
      label: 'Secondary list: Pokemons',
      ids: ['Charmander', 'Bulbasaur'],
    },
  },
  render: StoryComponent,
};

export const WithCreateWithAIButton: StoryObj<EntitySelectorProps> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonEnabled();
  },
  args: {
    aiSelectedPage: 'workflows',
    aiYamlSelector: 'workflow',
  },
  render: StoryComponent,
};

export const WithCreateWithAIButtonDisabled: StoryObj<EntitySelectorProps> = {
  beforeEach: () => {
    window.parent.pageProps = aiButtonDisabled();
  },
  args: {
    aiSelectedPage: 'workflows',
    aiYamlSelector: 'workflow',
  },
  render: StoryComponent,
};

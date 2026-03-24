import { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import EntitySelector, { EntitySelectorProps } from './EntitySelector';

const meta: Meta<EntitySelectorProps> = {
  component: EntitySelector,
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
  args: {
    aiSelectedPage: 'workflows',
    aiYamlSelector: 'workflow',
  },
  render: StoryComponent,
};

export const WithCreateWithAIButtonDisabled: StoryObj<EntitySelectorProps> = {
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
  args: {
    aiSelectedPage: 'workflows',
    aiYamlSelector: 'workflow',
  },
  render: StoryComponent,
};

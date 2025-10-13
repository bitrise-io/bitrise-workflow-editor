import { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';

import EntitySelector, { EntitySelectorProps } from './EntitySelector';

const meta: Meta<EntitySelectorProps> = {
  component: EntitySelector,
  args: {
    entityIds: [
      'foo',
      'bar',
      'akarmi',
      'asddasasd',
      'sdfdfdfsdf',
      'asddsasddsa',
      'asddasdassda',
      'asddsadsadsa',
      'asdffaadf',
      'utso',
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

const StoryCompoent = (props: EntitySelectorProps) => {
  // eslint-disable-next-line react/destructuring-assignment
  const [value, setValue] = useState<string | undefined>(props.entityIds[0]);
  return <EntitySelector {...props} onChange={setValue} value={value || undefined} />;
};

export const WithProps = {
  render: StoryCompoent,
};

export const WithSecondaryList: StoryObj<EntitySelectorProps> = {
  args: {
    secondaryEntities: {
      label: 'Secondary list',
      ids: ['alma', 'banan'],
    },
  },
  render: StoryCompoent,
};

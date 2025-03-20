import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { set } from 'es-toolkit/compat';
import StepApiMocks from '@/core/api/StepApi.mswMocks';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import StepSelectorDrawer from './StepSelectorDrawer';

type Story = StoryObj<typeof StepSelectorDrawer>;

const extendBeforeEach = (storyObj: Story, newBeforeEach: Story['beforeEach']) => {
  let beforeEach: Story['beforeEach'] = [];
  if (Array.isArray(storyObj.beforeEach)) {
    beforeEach = [...storyObj.beforeEach];
  } else if (storyObj.beforeEach) {
    beforeEach = [storyObj.beforeEach];
  }

  if (newBeforeEach) {
    beforeEach.push(...(Array.isArray(newBeforeEach) ? newBeforeEach : [newBeforeEach]));
  }

  return { ...storyObj, beforeEach };
};

const extendDecorators = (storyObj: Story, newDecorators: Story['decorators']) => {
  let decorators: Story['decorators'] = [];
  if (Array.isArray(storyObj.decorators)) {
    decorators = [...storyObj.decorators];
  } else if (storyObj.decorators) {
    decorators = [storyObj.decorators];
  }

  if (newDecorators) {
    decorators.push(...(Array.isArray(newDecorators) ? newDecorators : [newDecorators]));
  }

  return { ...storyObj, decorators };
};

const withStepLimit = (storyObj: Story, limit = 3) => {
  let copy = { ...storyObj };

  set(copy, 'args.enabledSteps', new Set(['activate-ssh-key', 'deploy-to-bitrise-io']));

  copy = extendBeforeEach(copy, () => {
    set(window, 'parent.pageProps.limits.uniqueStepLimit', limit);
  });

  copy = extendDecorators(copy, (Story, { args }) => {
    const [enabledSteps, setEnabledSteps] = useState(args.enabledSteps);

    return (
      <Story
        args={{
          ...args,
          enabledSteps,
          onSelectStep: (cvs) => {
            args.onSelectStep(cvs);
            setEnabledSteps((prev) => new Set([...Array.from(prev?.values() ?? []), cvs.split('@')[0]]));
          },
        }}
      />
    );
  });

  return copy;
};

export default {
  component: StepSelectorDrawer,
  args: {
    isOpen: true,
  },
  argTypes: {
    onOpen: { type: 'function' },
    onClose: { type: 'function' },
    onSelectStep: { type: 'function' },
  },
  decorators: [(Story) => withBitriseYml(TEST_BITRISE_YML, Story)],
  parameters: {
    msw: {
      handlers: [StepApiMocks.getAlgoliaSteps({ status: 'success' })],
    },
  },
} as Meta<typeof StepSelectorDrawer>;

export const Default: Story = {};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [StepApiMocks.getAlgoliaSteps({ status: 'error' })],
    },
  },
};

export const WithStepLimit: Story = withStepLimit(Default);

import { Meta, StoryObj } from '@storybook/react';

import InfoTooltip from './InfoTooltip';

export default {
  component: InfoTooltip,
} as Meta<typeof InfoTooltip>;

export const WithProps: StoryObj<typeof InfoTooltip> = {
  args: {
    label: 'Label text',
  },
};

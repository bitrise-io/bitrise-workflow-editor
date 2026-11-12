import { Meta, StoryObj } from '@storybook/react-vite';

import ChunkLoadErrorBoundary from './ChunkLoadErrorBoundary';

const Crash = ({ thrown }: { thrown: unknown }): never => {
  throw thrown;
};

/** A route whose chunk failed to download, inside the boundary every lazy route gets. */
const FailedRoute = ({ thrown }: { thrown: unknown }) => (
  <ChunkLoadErrorBoundary>
    <Crash thrown={thrown} />
  </ChunkLoadErrorBoundary>
);

export default {
  component: FailedRoute,
  args: {
    thrown: new TypeError(
      'Failed to fetch dynamically imported module: https://app.bitrise.io/workflow_editor/2.5.16985/assets/PipelinesPage-DLLNQ0V0.js',
    ),
  },
  argTypes: { thrown: { control: false } },
} as Meta<typeof FailedRoute>;

export const ChunkFailedToLoad: StoryObj<typeof FailedRoute> = {};

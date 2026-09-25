import { Meta, StoryObj } from '@storybook/react-vite';

import RootErrorBoundary from './RootErrorBoundary';

const Crash = ({ thrown }: { thrown: unknown }): never => {
  throw thrown;
};

/** A page that throws on every render, inside the boundary the app mounts at its root. */
const CrashingPage = ({ thrown }: { thrown: unknown }) => (
  <RootErrorBoundary>
    <Crash thrown={thrown} />
  </RootErrorBoundary>
);

// The error page reads the hash once, while it renders. In Storybook `window.parent` is the
// manager, so its hash is put back afterwards.
function onPage(hash: string) {
  return () => {
    const previousHash = window.parent.location.hash;
    window.parent.location.hash = hash;
    return () => {
      window.parent.location.hash = previousHash;
    };
  };
}

export default {
  component: CrashingPage,
  args: { thrown: new Error("Cannot read properties of undefined (reading 'steps')") },
  argTypes: { thrown: { control: false } },
  parameters: { layout: 'fullscreen' },
} as Meta<typeof CrashingPage>;

type Story = StoryObj<typeof CrashingPage>;

export const OnAVisualPage: Story = {
  beforeEach: onPage('#!/workflows'),
};

export const OnABranch: Story = {
  beforeEach: onPage('#!/workflows?branch=feature-x'),
};

export const OnTheYamlPage: Story = {
  beforeEach: onPage('#!/yml'),
};

export const NotAnErrorThrown: Story = { ...OnAVisualPage, args: { thrown: undefined } };

export const ErrorWithoutAMessage: Story = { ...OnAVisualPage, args: { thrown: new Error('') } };

export const UnprintableValueThrown: Story = { ...OnAVisualPage, args: { thrown: Object.create(null) } };

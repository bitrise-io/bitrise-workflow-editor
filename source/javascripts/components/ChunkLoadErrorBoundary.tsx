import { BitkitButton, BitkitEmptyState, IconErrorCircle, IconRefresh } from '@bitrise/bitkit-v2';
import { datadogRum } from '@datadog/browser-rum';
import { Component, PropsWithChildren } from 'react';

import { isChunkLoadError } from '@/core/utils/chunkLoadError';
import WindowUtils from '@/core/utils/WindowUtils';

type State = { error?: unknown };

// Keeps a page whose chunk failed to download inside the layout, so the header (Save) and the
// unsaved-changes prompt still work. Any other error is rethrown to the root boundary, unreported
// here so it isn't reported twice.
class ChunkLoadErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error)) {
      datadogRum.addError(error, { source: 'route-chunk-load' });
    }
  }

  render() {
    const { error } = this.state;

    if (error === undefined) {
      return this.props.children;
    }

    if (!isChunkLoadError(error)) {
      throw error;
    }

    return (
      <BitkitEmptyState
        icon={IconErrorCircle}
        headingText="This page couldn't be loaded"
        bodyText="Part of the editor failed to download. Save your changes, then reload to try again."
      >
        <BitkitButton icon={IconRefresh} size="md" variant="secondary" onClick={() => WindowUtils.reloadEditor()}>
          Reload
        </BitkitButton>
      </BitkitEmptyState>
    );
  }
}

export default ChunkLoadErrorBoundary;

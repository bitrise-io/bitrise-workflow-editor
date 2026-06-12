/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import useSelectedWorkflow from './useSelectedWorkflow';

describe('useSelectedWorkflow', () => {
  beforeEach(() => {
    updateBitriseYmlDocumentByString(yaml`
      workflows:
        wf1: {}
        wf2: {}
    `);
    window.parent.location.hash = '#/workflows?workflow_id=wf1';
  });

  it('selects the workflow requested in the location hash', () => {
    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf1');
  });

  it('validates against the live hash, so a synchronous hash change is picked up before hashchange fires', () => {
    const { result, rerender } = renderHook(() => useSelectedWorkflow());
    expect(result.current[0]).toBe('wf1');

    // Simulate a synchronous jump-to-definition: the hash is replaced and a re-render
    // happens (e.g. the active file swaps) before the `hashchange` event has fired —
    // the useSearchParams snapshot still holds workflow_id=wf1 at this point.
    window.parent.location.hash = '#/workflows?workflow_id=wf2';
    rerender();

    // A snapshot-based read would lag behind (wf1) and the self-correcting effect
    // would pin wf1 back into the URL, clobbering the jump target.
    expect(result.current[0]).toBe('wf2');
    expect(window.parent.location.hash).toContain('workflow_id=wf2');
  });

  it('falls back to the first runnable workflow and corrects the URL when the requested id is unknown', () => {
    window.parent.location.hash = '#/workflows?workflow_id=does-not-exist';

    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf1');
    expect(window.parent.location.hash).toContain('workflow_id=wf1');
  });

  it('resolves a generated parallel-workflow variant to its original id', () => {
    window.parent.location.hash = '#/workflows?workflow_id=wf2_3';

    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf2');
  });
});

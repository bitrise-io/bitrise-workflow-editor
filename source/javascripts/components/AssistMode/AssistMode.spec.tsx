/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';

import WindowUtils from '@/core/utils/WindowUtils';

import useAssistStore from './assist.store';
import AssistMode from './AssistMode';
import assistProps from './assistProps';

// window.parent === window under jsdom, so a real post would loop straight back into
// this page's own message listener.
const postMessageToParent = jest.spyOn(WindowUtils, 'postMessageToParent').mockImplementation(() => {});

// What the parent's AssistWfeBridge posts on every toggle (and as the handshake answer).
const receiveAssistModeChanged = (isActive: boolean) => {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: 'ASSIST_MODE_CHANGED', payload: { isActive } },
      }),
    );
  });
};

const renderWithAnchor = () =>
  render(
    <>
      <AssistMode />
      <span {...assistProps('wfe.step')}>Git Clone</span>
    </>,
  );

describe('AssistMode', () => {
  beforeEach(() => {
    postMessageToParent.mockClear();
    act(() => useAssistStore.setState({ isActive: false, anchor: null }));
  });

  afterEach(() => {
    document.body.classList.remove('assist-mode-on');
  });

  it('asks the parent for the current state on boot', () => {
    renderWithAnchor();

    expect(postMessageToParent).toHaveBeenCalledWith('ASSIST_MODE_REQUESTED');
  });

  it('follows the parent through ASSIST_MODE_CHANGED', () => {
    renderWithAnchor();

    receiveAssistModeChanged(true);
    expect(useAssistStore.getState().isActive).toBe(true);
    expect(document.body.classList.contains('assist-mode-on')).toBe(true);

    receiveAssistModeChanged(false);
    expect(useAssistStore.getState().isActive).toBe(false);
    expect(document.body.classList.contains('assist-mode-on')).toBe(false);
  });

  it('shows the explanation card with a docs link when hovering an annotated element', () => {
    renderWithAnchor();
    receiveAssistModeChanged(true);

    fireEvent.pointerOver(screen.getByText('Git Clone'));

    expect(screen.getByRole('dialog', { name: 'Step' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Adding steps to a workflow/ }).getAttribute('href')).toBe(
      'https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines/steps/adding-steps-to-a-workflow',
    );
  });

  it('stays inert while the mode is off', () => {
    renderWithAnchor();

    fireEvent.pointerOver(screen.getByText('Git Clone'));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.classList.contains('assist-mode-on')).toBe(false);
  });
});

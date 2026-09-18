import { useEffect, useRef } from 'react';

import WindowUtils from '@/core/utils/WindowUtils';
import useParentMessageListener from '@/hooks/useParentMessageListener';

import useAssistStore from './assist.store';
import AssistCard, { ASSIST_CARD_ATTRIBUTE } from './AssistCard';
import { ASSIST_ID_ATTRIBUTE } from './assistProps';
import { isAssistId } from './assistRegistry';

// Long enough to move the pointer from the anchor into the card without it vanishing.
const HIDE_DELAY_MS = 250;

// A document-level stylesheet keeps annotating an element a zero-cost data attribute: no
// per-element React work, and no styling at all while assisted mode is off. Same rules as
// the monolith's AssistProvider; `:empty` skips anchors whose host component rendered nothing.
const highlightStyles = `
  body.assist-mode-on [${ASSIST_ID_ATTRIBUTE}]:not(:empty) {
    outline: 2px dashed rgba(118, 15, 195, 0.45);
    outline-offset: 2px;
    border-radius: 4px;
    cursor: help;
  }
  body.assist-mode-on [${ASSIST_ID_ATTRIBUTE}]:not(:empty):hover {
    outline-style: solid;
    outline-color: #760fc3;
  }
`;

/**
 * The editor's thin half of the website's assisted mode. The parent page owns the toggle;
 * this component syncs with it over postMessage (ASSIST_MODE_REQUESTED out once on boot,
 * ASSIST_MODE_CHANGED in on every toggle) and, while active, highlights `data-assist-id`
 * anchors and shows their explanation card on hover. Mount it only in website mode: in CLI
 * mode there is no parent to sync with and the feature stays entirely inert.
 */
const AssistMode = () => {
  const isActive = useAssistStore((s) => s.isActive);
  const hideTimerRef = useRef<number>();

  useParentMessageListener<{ isActive: boolean } | undefined>('ASSIST_MODE_CHANGED', (payload) => {
    useAssistStore.getState().setActive(Boolean(payload?.isActive));
  });

  // The editor boots later than the parent page, so it has to ask for the current state:
  // an ASSIST_MODE_CHANGED posted before this component's listener existed is lost.
  useEffect(() => {
    WindowUtils.postMessageToParent('ASSIST_MODE_REQUESTED');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('assist-mode-on', isActive);
    return () => document.body.classList.remove('assist-mode-on');
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const cancelHide = () => window.clearTimeout(hideTimerRef.current);
    const scheduleHide = () => {
      cancelHide();
      hideTimerRef.current = window.setTimeout(() => useAssistStore.getState().hideCard(), HIDE_DELAY_MS);
    };

    const onTargetChange = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;

      const anchorElement = target?.closest(`[${ASSIST_ID_ATTRIBUTE}]`);
      if (anchorElement instanceof HTMLElement) {
        const id = anchorElement.getAttribute(ASSIST_ID_ATTRIBUTE);
        if (isAssistId(id)) {
          cancelHide();
          useAssistStore.getState().showCard({ id, element: anchorElement });
          return;
        }
      }

      // Moving into the card itself must not dismiss it, or its docs link could never be clicked.
      if (target?.closest(`[${ASSIST_CARD_ATTRIBUTE}]`)) {
        cancelHide();
        return;
      }

      if (useAssistStore.getState().anchor) {
        scheduleHide();
      }
    };

    document.addEventListener('pointerover', onTargetChange);
    // Keyboard path: focusing an already-focusable anchor shows its card too.
    document.addEventListener('focusin', onTargetChange);
    return () => {
      cancelHide();
      document.removeEventListener('pointerover', onTargetChange);
      document.removeEventListener('focusin', onTargetChange);
    };
  }, [isActive]);

  return (
    <>
      <style>{highlightStyles}</style>
      <AssistCard />
    </>
  );
};

export default AssistMode;

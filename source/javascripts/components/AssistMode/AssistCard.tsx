import { CSSProperties, useLayoutEffect, useRef } from 'react';

import useAssistStore from './assist.store';
import { assistRegistry } from './assistRegistry';

export const ASSIST_CARD_ATTRIBUTE = 'data-assist-card';

const CARD_WIDTH = 320;
const GAP = 8;

// Plain styled elements on purpose: the card floats over both Bitkit generations and
// mirrors the monolith's hard-coded brand purple, which no theme token reaches from here.
const cardStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 10000,
  width: CARD_WIDTH,
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #dfdae1',
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(32, 27, 34, 0.16)',
  color: '#201b22',
  fontSize: '14px',
  lineHeight: 1.5,
};

const AssistCard = () => {
  const anchor = useAssistStore((s) => s.anchor);
  const cardRef = useRef<HTMLDivElement>(null);

  // Position after render so the card's real height is known: below the anchor by default,
  // above it when the viewport bottom is too close, clamped horizontally. Written straight
  // to the DOM node — positioning through state would need a second render pass.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!anchor || !card) {
      return;
    }

    const anchorRect = anchor.element.getBoundingClientRect();
    const cardHeight = card.offsetHeight;

    let top = anchorRect.bottom + GAP;
    if (top + cardHeight > window.innerHeight - GAP) {
      top = Math.max(GAP, anchorRect.top - GAP - cardHeight);
    }
    const left = Math.min(Math.max(GAP, anchorRect.left), Math.max(GAP, window.innerWidth - CARD_WIDTH - GAP));

    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.style.visibility = 'visible';
  }, [anchor]);

  if (!anchor) {
    return null;
  }

  const entry = assistRegistry[anchor.id];

  return (
    <div
      // Keyed by anchor so hovering the next element remounts (and re-measures) the card
      // instead of leaving it positioned at the previous one.
      key={anchor.id}
      ref={cardRef}
      role="dialog"
      aria-label={entry.title}
      {...{ [ASSIST_CARD_ATTRIBUTE]: 'true' }}
      // Rendered invisibly at first so the position effect can measure before it shows.
      style={{ ...cardStyle, top: 0, left: 0, visibility: 'hidden' }}
    >
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '16px' }}>{entry.title}</p>
      <p style={{ margin: '0 0 12px' }}>{entry.body}</p>
      <a
        href={entry.docsUrl}
        target="_blank"
        rel="noreferrer"
        style={{ color: '#760fc3', fontWeight: 600, textDecoration: 'none' }}
      >
        {entry.docsLabel} ↗
      </a>
    </div>
  );
};

export default AssistCard;

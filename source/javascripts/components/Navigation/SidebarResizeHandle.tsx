import { Box } from '@chakra-ui/react/box';
import { KeyboardEvent, PointerEvent, useCallback, useState } from 'react';

// The list panel beside the rail can be dragged wider or narrower by its trailing edge. Bitkit's sidebar has
// no resizing of its own, so the handle is app-local. The width is kept per browser.
export const SIDEBAR_DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = 'wfe-sidebar-width';

const clamp = (width: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));

const readStoredWidth = () => {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return stored ? clamp(stored) : SIDEBAR_DEFAULT_WIDTH;
  } catch {
    return SIDEBAR_DEFAULT_WIDTH;
  }
};

export function useSidebarWidth() {
  const [width, setWidth] = useState(readStoredWidth);
  const resize = useCallback((next: number) => {
    const clamped = clamp(next);
    setWidth(clamped);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // Storage can be blocked; the width then lasts for this visit only.
    }
  }, []);
  return [width, resize] as const;
}

type Props = { width: number; onResize: (width: number) => void };

// Drag to resize, double-click to go back to the default width, or use the arrow keys when focused.
const SidebarResizeHandle = ({ width, onResize }: Props) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = width;
    handle.setPointerCapture(event.pointerId);
    setIsDragging(true);

    const handleMove = (moveEvent: globalThis.PointerEvent) => onResize(startWidth + moveEvent.clientX - startX);
    const handleEnd = () => {
      setIsDragging(false);
      handle.removeEventListener('pointermove', handleMove);
      handle.removeEventListener('pointerup', handleEnd);
      handle.removeEventListener('pointercancel', handleEnd);
    };
    handle.addEventListener('pointermove', handleMove);
    handle.addEventListener('pointerup', handleEnd);
    handle.addEventListener('pointercancel', handleEnd);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowLeft: width - KEYBOARD_STEP,
      ArrowRight: width + KEYBOARD_STEP,
      Home: MIN_WIDTH,
      End: MAX_WIDTH,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      onResize(next);
    }
  };

  return (
    <Box
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuenow={width}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      tabIndex={0}
      position="absolute"
      insetBlock="0"
      insetInlineEnd="-4px"
      width="8px"
      zIndex="1"
      cursor="col-resize"
      touchAction="none"
      outline="none"
      data-dragging={isDragging || undefined}
      onPointerDown={handlePointerDown}
      onDoubleClick={() => onResize(SIDEBAR_DEFAULT_WIDTH)}
      onKeyDown={handleKeyDown}
      // A thin line over the panel's edge shows where to grab, on hover (after a beat, so passing over it
      // doesn't flash), while dragging and when focused from the keyboard.
      _after={{
        content: '""',
        position: 'absolute',
        insetBlock: '0',
        insetInlineStart: '3px',
        width: '2px',
        background: 'border/selected',
        opacity: 0,
        transition: 'opacity 0.15s',
      }}
      _hover={{ _after: { opacity: 1, transitionDelay: '0.2s' } }}
      _focusVisible={{ _after: { opacity: 1 } }}
      css={{ '&[data-dragging]::after': { opacity: 1 } }}
    />
  );
};

export default SidebarResizeHandle;

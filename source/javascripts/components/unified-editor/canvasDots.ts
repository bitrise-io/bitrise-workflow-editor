// One dot grid for every canvas (Pipelines, Workflows, Step bundles), so they read as the same kind of
// surface: 1.5px dots, 16px apart, in the regular border gray.
export const CANVAS_DOT_GAP = 16;
export const CANVAS_DOT_SIZE = 1.5;
export const CANVAS_DOT_COLOR = 'border/regular';

// For canvases that aren't React Flow: the same grid as a CSS background, scrolling with the content.
export const canvasDotsBackground = {
  backgroundImage: `radial-gradient(circle, var(--colors-border-regular) ${CANVAS_DOT_SIZE / 2}px, transparent ${CANVAS_DOT_SIZE / 2 + 0.5}px)`,
  backgroundSize: `${CANVAS_DOT_GAP}px ${CANVAS_DOT_GAP}px`,
  backgroundAttachment: 'local',
} as const;

// The canvases sit slightly below the page around them: a soft inset shadow, a little stronger under the
// top edge (the header), fading out gently. No Bitkit token covers inset shadows on surfaces.
export const CANVAS_EDGE_SHADOW =
  '0 0.125rem 0.75rem -0.25rem rgba(0, 0, 0, 0.06) inset, 0 0 1.5rem 0 rgba(0, 0, 0, 0.025) inset';

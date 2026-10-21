// One dot grid for every canvas (Pipelines, Workflows, Step bundles), so they read as the same kind of
// surface: 1.5px dots, 16px apart, one step darker than the regular border gray.
export const CANVAS_DOT_GAP = 16;
export const CANVAS_DOT_SIZE = 1.5;
export const CANVAS_DOT_COLOR = 'sys/border/emphasized';

// For canvases that aren't React Flow: the same grid as a CSS background, scrolling with the content.
export const canvasDotsBackground = {
  backgroundImage: `radial-gradient(circle, var(--colors-sys-border-emphasized) ${CANVAS_DOT_SIZE / 2}px, transparent ${CANVAS_DOT_SIZE / 2 + 0.5}px)`,
  backgroundSize: `${CANVAS_DOT_GAP}px ${CANVAS_DOT_GAP}px`,
  backgroundAttachment: 'local',
} as const;

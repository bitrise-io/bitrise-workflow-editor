// Chrome/Firefox and Safari word a failed dynamic import differently; the last one is Vite's CSS preload.
const CHUNK_LOAD_ERROR = /dynamically imported module|Importing a module script failed|Unable to preload CSS/;

export function isChunkLoadError(thrown: unknown) {
  return thrown instanceof Error && CHUNK_LOAD_ERROR.test(thrown.message);
}

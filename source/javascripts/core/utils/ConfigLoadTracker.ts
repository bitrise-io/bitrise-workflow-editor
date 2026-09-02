/**
 * Tracks whether the YAML store has already been initialised, and for which requested branch.
 *
 * This deliberately lives at module scope rather than in a component ref, because the fact it
 * records is about the module-scoped `bitriseYmlStore` — not about any component instance. The
 * top-level `ErrorBoundary`'s `PassThroughFallback` remounts the whole subtree on any render
 * error, and a component ref would reset and make that remount look like a first load, so the
 * store would be re-initialised from the saved config and every unsaved change silently lost.
 *
 * `null` means "never loaded", which is distinct from `undefined` ("loaded, no branch requested").
 */
let loadedBranch: string | undefined | null = null;
let hasPreloadedRoutes = false;
let hasTrackedBranchLoad = false;

function shouldLoad(requestedBranch?: string) {
  return loadedBranch !== requestedBranch;
}

function markLoaded(requestedBranch?: string) {
  loadedBranch = requestedBranch;
}

/** True on the first call only — the caller runs its one-time route preload behind this. */
function claimRoutePreload() {
  if (hasPreloadedRoutes) {
    return false;
  }
  hasPreloadedRoutes = true;
  return true;
}

/** True on the first call only — keeps the branch-loaded analytics event to one per session. */
function claimBranchLoadTracking() {
  if (hasTrackedBranchLoad) {
    return false;
  }
  hasTrackedBranchLoad = true;
  return true;
}

/** Test-only: module state outlives components by design, so specs need an explicit reset. */
function reset() {
  loadedBranch = null;
  hasPreloadedRoutes = false;
  hasTrackedBranchLoad = false;
}

export default {
  shouldLoad,
  markLoaded,
  claimRoutePreload,
  claimBranchLoadTracking,
  reset,
};

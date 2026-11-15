import { createContext, useContext } from 'react';

/**
 * True while the initial CI config is still loading — covering both bootstrap phases: the
 * "does the repo have a config" settings check and the subsequent tree/legacy fetch. Provided by
 * `InitialDataLoader` (which owns the queries) so the layout can show the loading state inside the
 * content area while keeping the header + navigation visible.
 */
const ConfigLoadingContext = createContext(false);

export const ConfigLoadingProvider = ConfigLoadingContext.Provider;

export const useIsConfigLoading = () => useContext(ConfigLoadingContext);

/**
 * True when the initial CI config couldn't be loaded. The layout then keeps the shell but offers only
 * the pages that don't read the config (Secrets).
 */
const ConfigLoadFailedContext = createContext(false);

export const ConfigLoadFailedProvider = ConfigLoadFailedContext.Provider;

export const useIsConfigLoadFailed = () => useContext(ConfigLoadFailedContext);

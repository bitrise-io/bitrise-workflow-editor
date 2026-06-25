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

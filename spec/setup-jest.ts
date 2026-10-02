import { yaml as yamlHelper } from './yaml-helper';

// eslint-disable-next-line no-undef
(global as any).yaml = yamlHelper;

// jsdom implements no media queries, but Chakra's `useMediaQuery` (behind responsive props) calls
// `matchMedia` on mount. Report "no match" for everything so components render their base variant.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// framer-motion (behind Chakra's Collapse/transitions) measures keyframes via `scrollTo`, which
// jsdom only stubs with a "Not implemented" console error. Silence it with a no-op.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// The app is bootstrapped with `window.env` by the server-rendered page (see typings/globals.d.ts).
// Several modules read it while being imported (RuntimeUtils -> PageProps -> analytics), so any
// component test would fail at import time without it. Defaults match CLI/plugin mode.
if (typeof window !== 'undefined' && !window.env) {
  window.env = {
    CLARITY: 'false',
    ANALYTICS: 'false',
    DATADOG_RUM: 'false',
    MODE: 'CLI',
    NODE_ENV: 'development',
    PUBLIC_URL_ROOT: '',
    WFE_VERSION: 'test',
  };
}

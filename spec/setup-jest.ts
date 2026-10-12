import { yaml as yamlHelper } from './yaml-helper';

// eslint-disable-next-line no-undef
(global as any).yaml = yamlHelper;

// jsdom implements none of these, but Bitkit's provider and selects read them on mount. The node
// environment specs have no window at all.
if (typeof window !== 'undefined') {
  window.ResizeObserver ??= class {
    observe() {}

    unobserve() {}

    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
  // jsdom has no layout engine, so there is nothing to scroll.
  Element.prototype.scrollIntoView ??= () => {};
}

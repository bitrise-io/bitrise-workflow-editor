/**
 * @jest-environment jsdom
 */
import { preloadRoutes, routes } from './routes';

jest.mock('react-lazy-with-preload', () => ({
  lazyWithPreload: () => Object.assign(() => null, { preload: jest.fn(() => Promise.resolve()) }),
}));

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
}

const preloads = () => routes.map((route) => route.component.preload as jest.Mock);

describe('preloadRoutes', () => {
  beforeEach(() => {
    preloads().forEach((preload) => preload.mockClear());
    setVisibility('visible');
  });

  it('preloads every route when the tab is visible', () => {
    preloadRoutes();

    preloads().forEach((preload) => expect(preload).toHaveBeenCalledTimes(1));
  });

  it('waits for the tab to become visible before preloading', () => {
    setVisibility('hidden');
    preloadRoutes();

    preloads().forEach((preload) => expect(preload).not.toHaveBeenCalled());

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    preloads().forEach((preload) => expect(preload).toHaveBeenCalledTimes(1));
  });

  it('does not leave a failed preload as an unhandled rejection', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);
    preloads().forEach((preload) =>
      preload.mockReturnValueOnce(Promise.reject(new TypeError('Failed to fetch dynamically imported module'))),
    );

    preloadRoutes();
    await new Promise((resolve) => setTimeout(resolve, 0));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });
});

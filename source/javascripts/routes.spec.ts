/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';

import { preloadRoutes, routes } from './routes';

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addError: jest.fn() } }));
jest.mock('react-lazy-with-preload', () => ({
  lazyWithPreload: () => Object.assign(() => null, { preload: jest.fn(() => Promise.resolve()) }),
}));

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
}

const preloads = () => routes.map((route) => route.component.preload as jest.Mock);

describe('preloadRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('reports a failed preload to RUM instead of leaving it as an unhandled rejection', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);
    const error = new TypeError('Failed to fetch dynamically imported module');
    preloads().forEach((preload) => preload.mockReturnValueOnce(Promise.reject(error)));

    preloadRoutes();
    await new Promise((resolve) => setTimeout(resolve, 0));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
    expect(datadogRum.addError).toHaveBeenCalledTimes(routes.length);
    expect(datadogRum.addError).toHaveBeenCalledWith(error, { source: 'route-preload', visibilityState: 'visible' });
  });
});

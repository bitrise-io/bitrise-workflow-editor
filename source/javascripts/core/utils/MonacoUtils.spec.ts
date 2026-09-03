/**
 * @jest-environment jsdom
 */
// `monaco-editor` and friends are browser-only ESM bundles jest can't even resolve, and the guard
// under test needs none of them — it only ever touches the editor object it is handed.
jest.mock('monaco-editor', () => ({ editor: {}, MarkerSeverity: { Error: 8, Warning: 4 } }), { virtual: true });
jest.mock('monaco-yaml', () => ({ configureMonacoYaml: jest.fn() }), { virtual: true });
jest.mock('@bitrise/languageserver/monaco', () => ({ configureBitriseYaml: jest.fn() }), { virtual: true });
jest.mock('@monaco-editor/react', () => ({ loader: { config: jest.fn() } }), { virtual: true });

const MARKER_NAVIGATION_CONTROLLER_ID = 'editor.contrib.markerController';

type MarkerController = {
  showAtMarker: (marker: unknown) => void;
  navigate: (next: boolean, multiFile?: boolean) => Promise<void>;
  close: jest.Mock<void, [boolean?]>;
};

type MonacoUtilsModule = {
  configureMarkerNavigationGuard: (monacoInstance: unknown) => void;
};

/**
 * A fresh module instance per test — `configureMarkerNavigationGuard` is guarded by a module-level
 * "already configured" flag, like the other `configure*` helpers.
 */
function loadMonacoUtils(): MonacoUtilsModule {
  let loaded: MonacoUtilsModule | undefined;

  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = require('./MonacoUtils').default;
  });

  if (!loaded) {
    throw new Error('MonacoUtils failed to load');
  }

  return loaded;
}

/**
 * A controller whose session is broken for the first `brokenAttempts` calls and healthy afterwards,
 * mirroring Monaco's own state: a marker list without its peek widget throws until the session is
 * closed and rebuilt.
 */
function createBrokenController(brokenAttempts: number) {
  const attempts = { showAtMarker: 0, navigate: 0 };

  const controller: MarkerController = {
    showAtMarker: () => {
      attempts.showAtMarker += 1;
      if (attempts.showAtMarker <= brokenAttempts) {
        throw new TypeError("Cannot read properties of undefined (reading 'showAtMarker')");
      }
    },
    navigate: async () => {
      attempts.navigate += 1;
      if (attempts.navigate <= brokenAttempts) {
        throw new TypeError("Cannot read properties of undefined (reading 'showAtMarker')");
      }
    },
    close: jest.fn(),
  };

  return { controller, attempts };
}

function guard(controller: object | null, { onCreate = false } = {}) {
  const editor = {
    getContribution: (id: string) => (id === MARKER_NAVIGATION_CONTROLLER_ID ? controller : null),
  };

  loadMonacoUtils().configureMarkerNavigationGuard({
    editor: {
      getEditors: () => (onCreate ? [] : [editor]),
      onDidCreateEditor: (listener: (created: typeof editor) => void) => {
        if (onCreate) {
          listener(editor);
        }
        return { dispose: () => {} };
      },
    },
  });

  return editor;
}

describe('MonacoUtils.configureMarkerNavigationGuard', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rebuilds the session and retries when showAtMarker fails', () => {
    const { controller, attempts } = createBrokenController(1);
    guard(controller);

    expect(() => controller.showAtMarker({})).not.toThrow();

    expect(controller.close).toHaveBeenCalledWith(false);
    expect(attempts.showAtMarker).toBe(2);
  });

  it('rebuilds the session and retries when navigate fails', async () => {
    const { controller, attempts } = createBrokenController(1);
    guard(controller);

    await expect(controller.navigate(true)).resolves.toBeUndefined();

    expect(controller.close).toHaveBeenCalledWith(false);
    expect(attempts.navigate).toBe(2);
  });

  it('leaves a healthy session alone', () => {
    const { controller, attempts } = createBrokenController(0);
    guard(controller);

    controller.showAtMarker({});

    expect(controller.close).not.toHaveBeenCalled();
    expect(attempts.showAtMarker).toBe(1);
  });

  it('lets a failure on the rebuilt session propagate', () => {
    const { controller, attempts } = createBrokenController(2);
    guard(controller);

    expect(() => controller.showAtMarker({})).toThrow("Cannot read properties of undefined (reading 'showAtMarker')");
    expect(attempts.showAtMarker).toBe(2);
  });

  it('guards editors created after it is configured', () => {
    const { controller, attempts } = createBrokenController(1);
    guard(controller, { onCreate: true });

    expect(() => controller.showAtMarker({})).not.toThrow();
    expect(attempts.showAtMarker).toBe(2);
  });

  it('does not wrap the same controller twice', () => {
    // Two broken attempts, so one layer of wrapping gives up and rethrows. A second layer would
    // catch that rethrow and buy the call a third attempt — which this controller survives.
    const { controller, attempts } = createBrokenController(2);
    const editor = {
      getContribution: (id: string) => (id === MARKER_NAVIGATION_CONTROLLER_ID ? controller : null),
    };
    const listeners: ((created: typeof editor) => void)[] = [];

    loadMonacoUtils().configureMarkerNavigationGuard({
      editor: {
        getEditors: () => [editor, editor],
        onDidCreateEditor: (listener: (created: typeof editor) => void) => {
          listeners.push(listener);
          return { dispose: () => {} };
        },
      },
    });
    listeners.forEach((listener) => listener(editor));

    expect(() => controller.showAtMarker({})).toThrow("Cannot read properties of undefined (reading 'showAtMarker')");
    expect(attempts.showAtMarker).toBe(2);
    expect(controller.close).toHaveBeenCalledTimes(1);
  });

  // The type argument to `getContribution` is erased at build time, so only a runtime check keeps a
  // renamed or removed method from throwing while an editor is being created.
  it.each(['showAtMarker', 'navigate', 'close'])('leaves a contribution alone when %s is missing', (missing) => {
    const complete: Record<string, unknown> = {
      showAtMarker: () => {},
      navigate: async () => {},
      close: () => {},
    };
    const controller: Record<string, unknown> = { ...complete };
    delete controller[missing];

    expect(() => guard(controller)).not.toThrow();

    // Nothing was replaced: the guard behaves as if it had never been installed.
    Object.keys(controller).forEach((name) => {
      expect(controller[name]).toBe(complete[name]);
    });
  });

  it('leaves a contribution alone when an expected method is not callable', () => {
    const controller = { showAtMarker: 'not a function', navigate: async () => {}, close: () => {} };
    const { navigate, close } = controller;

    expect(() => guard(controller)).not.toThrow();

    expect(controller.navigate).toBe(navigate);
    expect(controller.close).toBe(close);
  });

  it('wraps a contribution that has all of the expected methods', () => {
    const { controller } = createBrokenController(0);
    const original = controller.showAtMarker;

    guard(controller);

    expect(controller.showAtMarker).not.toBe(original);
  });

  it('tolerates an editor without a marker navigation controller', () => {
    expect(() => guard(null)).not.toThrow();
  });
});

import syncIntercomWithEditorNavigation, { IntercomWindow } from './intercomPageSync';

const EDITOR_ORIGIN = 'https://app.bitrise.io/wfe/index.html';

const createWindows = (initialHash: string) => {
  const hashChangeListeners = new Set<() => void>();

  const parentWindow = {
    location: { hash: initialHash },
    Intercom: jest.fn(),
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'hashchange') {
        hashChangeListeners.add(listener);
      }
    },
  };

  const editorWindow = {
    location: { href: `${EDITOR_ORIGIN}${initialHash}` },
    history: {
      state: null,
      replaceState: jest.fn((state: unknown, _title: string, url: URL) => {
        editorWindow.history.state = state as null;
        editorWindow.location.href = url.toString();
      }),
    },
    Intercom: jest.fn(),
    parent: parentWindow,
  };

  const navigateParentTo = (hash: string) => {
    parentWindow.location.hash = hash;
    hashChangeListeners.forEach((listener) => listener());
  };

  return {
    parentWindow,
    editorWindow,
    navigateParentTo,
    editorWindowAsWindow: editorWindow as unknown as IntercomWindow,
  };
};

describe('syncIntercomWithEditorNavigation', () => {
  it('revalidates the page targeting of both Intercom instances when another editor page opens', () => {
    const { editorWindow, parentWindow, editorWindowAsWindow, navigateParentTo } = createWindows('#!/workflows');
    syncIntercomWithEditorNavigation(editorWindowAsWindow);

    navigateParentTo('#!/triggers');

    expect(editorWindow.Intercom).toHaveBeenCalledWith('update');
    expect(parentWindow.Intercom).toHaveBeenCalledWith('update');
  });

  it('keeps both instances quiet while only the search params of the same page change', () => {
    const { editorWindow, parentWindow, editorWindowAsWindow, navigateParentTo } = createWindows(
      '#!/workflows?workflow=primary&tab=configuration',
    );
    syncIntercomWithEditorNavigation(editorWindowAsWindow);

    navigateParentTo('#!/workflows?workflow=primary&tab=triggers');

    expect(editorWindow.Intercom).not.toHaveBeenCalled();
    expect(parentWindow.Intercom).not.toHaveBeenCalled();
  });

  it('mirrors the parent hash onto its own URL even when no revalidation happens', () => {
    const { editorWindow, editorWindowAsWindow, navigateParentTo } = createWindows('#!/workflows?tab=configuration');
    syncIntercomWithEditorNavigation(editorWindowAsWindow);

    navigateParentTo('#!/workflows?tab=triggers');

    expect(editorWindow.location.href).toBe(`${EDITOR_ORIGIN}#!/workflows?tab=triggers`);
  });

  it('revalidates again when the user leaves a page and comes back to it', () => {
    const { editorWindow, parentWindow, editorWindowAsWindow, navigateParentTo } = createWindows('#!/triggers');
    syncIntercomWithEditorNavigation(editorWindowAsWindow);

    navigateParentTo('#!/workflows');
    navigateParentTo('#!/triggers');

    expect(editorWindow.Intercom).toHaveBeenCalledTimes(2);
    expect(parentWindow.Intercom).toHaveBeenCalledTimes(2);
  });
});

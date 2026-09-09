type IntercomWindow = Window & {
  Intercom?: (command: string, ...args: unknown[]) => void;
};

const pageOfHash = (hash: string) => hash.split('?')[0];

const syncIntercomWithEditorNavigation = (win: IntercomWindow) => {
  const parentWin = win.parent as IntercomWindow;
  let lastVisitedPage = pageOfHash(parentWin.location.hash);

  const handleParentHashChange = () => {
    const parentHash = parentWin.location.hash;

    const ownUrl = new URL(win.location.href);
    if (ownUrl.hash !== parentHash) {
      ownUrl.hash = parentHash;
      win.history.replaceState(win.history.state, '', ownUrl);
    }

    const visitedPage = pageOfHash(parentHash);
    if (visitedPage === lastVisitedPage) {
      return;
    }

    lastVisitedPage = visitedPage;
    win.Intercom?.('update');
    parentWin.Intercom?.('update');
  };

  parentWin.addEventListener('hashchange', handleParentHashChange);
};

export type { IntercomWindow };
export default syncIntercomWithEditorNavigation;

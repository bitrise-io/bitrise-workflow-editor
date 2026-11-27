// The local API server opens the editor with a per-launch token in the URL and refuses /api/
// requests without it. Kept in sessionStorage so a reload of the tab still has it.
const URL_PARAM = 'token';
const STORAGE_KEY = 'wfe-local-api-token';

let token: string | null = null;

function capture() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get(URL_PARAM);
  if (!fromUrl) {
    return;
  }

  token = fromUrl;
  try {
    sessionStorage.setItem(STORAGE_KEY, fromUrl);
  } catch {
    // Without storage the token only lasts until the tab reloads
  }

  url.searchParams.delete(URL_PARAM);
  window.history.replaceState(window.history.state, '', url);
}

function get(): string | null {
  if (token) {
    return token;
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export default { capture, get };

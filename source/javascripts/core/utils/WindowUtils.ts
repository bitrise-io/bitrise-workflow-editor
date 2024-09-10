function globalProps() {
  return window.parent.globalProps;
}

function pageProps() {
  return window.parent.pageProps;
}

function appSlug() {
  return pageProps()?.project?.slug ?? null;
}

function workspaceSlug() {
  return globalProps()?.account?.slug ?? null;
}

function project() {
  return pageProps()?.project;
}

function limits() {
  return pageProps()?.limits;
}

export default {
  globalProps,
  pageProps,
  appSlug,
  workspaceSlug,
  project,
  limits,
};

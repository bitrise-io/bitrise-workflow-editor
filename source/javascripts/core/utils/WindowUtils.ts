function dataLayer() {
  return window.parent.dataLayer;
}

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

function userSlug() {
  return globalProps()?.user?.slug;
}

function project() {
  return pageProps()?.project;
}

function limits() {
  return pageProps()?.limits;
}

function abilities() {
  return pageProps()?.abilities;
}

export default {
  dataLayer,
  globalProps,
  pageProps,
  appSlug,
  workspaceSlug,
  userSlug,
  project,
  limits,
  abilities,
};

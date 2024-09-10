function globalProps() {
  return window.parent.globalProps;
}

function pageProps() {
  return window.parent.pageProps;
}

function appSlug() {
  return pageProps()?.project?.slug ?? null;
}

export default { globalProps, pageProps, appSlug };

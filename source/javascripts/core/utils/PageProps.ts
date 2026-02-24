import WindowUtils from '@/core/utils/WindowUtils';

import RuntimeUtils from './RuntimeUtils';

function pageProps() {
  return WindowUtils.instance().pageProps;
}

function app() {
  return pageProps()?.project;
}

function appSlug() {
  const fallback = RuntimeUtils.isWebsiteMode() ? window.location.pathname.match(/\/app\/([^/]+)/)?.[1] : undefined;
  return app()?.slug ?? fallback ?? '';
}

function abilities() {
  return pageProps()?.abilities;
}

function limits() {
  return pageProps()?.limits;
}

function settings() {
  return pageProps()?.settings;
}

export default {
  app,
  appSlug,
  abilities,
  limits,
  settings,
};

import WindowUtils from '@/core/utils/WindowUtils';

function pageProps() {
  return WindowUtils.instance().pageProps;
}

function app() {
  return pageProps()?.project;
}

function appSlug() {
  return app()?.slug ?? '';
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

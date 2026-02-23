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

function getInitialStepMaintainers(): string[] {
  const allowNonBitriseSteps = limits()?.allowNonBitriseSteps ?? true;
  return allowNonBitriseSteps ? [] : ['bitrise'];
}

export default {
  app,
  appSlug,
  abilities,
  limits,
  settings,
  getInitialStepMaintainers,
};

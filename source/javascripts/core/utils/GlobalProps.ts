import WindowUtils from '@/core/utils/WindowUtils';

function globalProps() {
  return WindowUtils.instance().globalProps;
}

function env() {
  return globalProps()?.env;
}

function user() {
  return globalProps()?.user;
}

function userSlug() {
  return user()?.slug ?? '';
}

function workspace() {
  return globalProps()?.account;
}

function workspaceSlug() {
  return workspace()?.slug ?? '';
}

function accountFeatureFlags() {
  return globalProps()?.featureFlags?.account;
}

export default {
  env,
  user,
  userSlug,
  workspace,
  workspaceSlug,
  accountFeatureFlags,
};

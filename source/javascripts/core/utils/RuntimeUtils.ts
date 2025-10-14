function isProduction() {
  return window.env.NODE_ENV === 'prod';
}

function isWebsiteMode() {
  return window.env.MODE === 'website';
}

function isLocalMode() {
  return !isWebsiteMode();
}

export default {
  isProduction,
  isWebsiteMode,
  isLocalMode,
};

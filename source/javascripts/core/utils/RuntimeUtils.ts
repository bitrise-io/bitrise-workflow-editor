function isProduction() {
  return window.env.NODE_ENV === 'production';
}

function isWebsiteMode() {
  return window.env.MODE === 'WEBSITE';
}

function isLocalMode() {
  return !isWebsiteMode();
}

export default {
  isProduction,
  isWebsiteMode,
  isLocalMode,
};

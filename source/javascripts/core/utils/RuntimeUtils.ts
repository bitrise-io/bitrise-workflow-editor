function isProduction() {
  return process.env.NODE_ENV === 'prod' || window.NODE_ENV === 'prod';
}

function isWebsiteMode() {
  return process.env.MODE?.toLowerCase() === 'website' || window.MODE?.toLowerCase() === 'website';
}

function isLocalMode() {
  return !isWebsiteMode();
}

export default {
  isProduction,
  isWebsiteMode,
  isLocalMode,
};

function isWebsiteMode() {
  return process.env.MODE?.toLowerCase() === 'website';
}

function isLocalMode() {
  return !isWebsiteMode();
}

export default {
  isWebsiteMode,
  isLocalMode,
};

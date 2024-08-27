function isWebsiteMode() {
  return process.env.MODE?.toLowerCase() === 'website';
}

function isLocalMode() {
  return process.env.MODE?.toLowerCase() === 'cli';
}

export default {
  isWebsiteMode,
  isLocalMode,
};

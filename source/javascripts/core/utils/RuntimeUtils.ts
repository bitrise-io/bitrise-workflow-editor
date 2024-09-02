function isWebsiteMode() {
  return process.env.MODE?.toLowerCase() === 'website';
}

function isCliMode() {
  return process.env.MODE?.toLowerCase() === 'cli';
}

export default {
  isWebsiteMode,
  isCliMode,
};

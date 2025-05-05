const reportedTimings: Set<string> = new Set();

export default (page: string, name: string, onloadOnly = true): void => {
  const time = Date.now();
  const reportName = `${page}_${name}`;

  if (onloadOnly) {
    if (reportedTimings.has(reportName)) {
      return;
    }

    reportedTimings.add(reportName);
  }

  const sendTimingWhenRUMIsAvailableOnWindow = () => {
    if (window.DD_RUM) {
      window.DD_RUM.addTiming(reportName, time);
    } else {
      setTimeout(sendTimingWhenRUMIsAvailableOnWindow, 100);
    }
  };

  if (process.env.DATADOG_RUM === 'true') {
    sendTimingWhenRUMIsAvailableOnWindow();
  }
};

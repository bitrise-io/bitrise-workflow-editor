import { datadogRum } from "@datadog/browser-rum";

const reportedTimings: Set<string> = new Set();

export default (page: string, name: string, onloadOnly = true): void => {
	const reportName = `${page}_${name}`;

	if (onloadOnly) {
		if (reportedTimings.has(reportName)) {
			return;
		}

		reportedTimings.add(reportName);
	}

	datadogRum.addTiming(reportName);
};

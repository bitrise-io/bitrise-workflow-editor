import { Step, SearchOptions } from "@bitrise/steplib-search";
import { Logger } from "./logger";

type ListOptions = {
	attributesToRetrieve?: string[];
	stepCVSs: string[];
	stepIDs: string[];
	includeInputs?: boolean;
	latestOnly?: boolean;
	projectTypes?: string[];
	includeDeprecated: boolean;
};

type FuzzySearchOptions = ListOptions & {
	query: string;
};

type StepVersion = Step & {
	id: string;
	version: string;
	info: object;
};

type StepLibSearchInstance = {
	list: (options: SearchOptions) => Promise<StepVersion[]>;
};

type StepLibSearchService = {
	list: (options: ListOptions) => Promise<StepVersion[]>;
	getStepVersions: (stepId: string, attributesToRetrieve: string[]) => Promise<StepVersion>;
	fuzzySearch: (options: FuzzySearchOptions) => Promise<StepVersion[]>;
};

// eslint-disable-next-line
// @ts-ignore
angular.module("BitriseWorkflowEditor").service(
	"stepLibSearchService",
	($q: any, stepLibSearchInstance: StepLibSearchInstance, logger: Logger): StepLibSearchService => {
		const convertSteps = (steps: StepVersion[]) =>
			steps.reduce((stepObj: object, stepVersion: StepVersion) => {
				const step = stepObj[stepVersion.id] || {};
				const versions = step.versions || {};
				versions[stepVersion.version] = Object.assign({}, stepVersion, stepVersion.info);

				const info = Object.assign({}, step.info, stepVersion.info);

				return Object.assign({}, stepObj, {
					[stepVersion.id]: {
						info: info,
						versions: versions
					}
				});
			}, {});

		return {
			list(options) {
				const attributesToRetrieve = options.attributesToRetrieve || ["*"];

				let filters;

				if (options.stepIDs) {
					filters = `(${options.stepIDs.map(id => `id:${id}`).join(" OR ")})`;
				}

				return stepLibSearchInstance
					.list({
						stepIds: options.stepCVSs,
						includeInputs: !!options.includeInputs,
						latestOnly: !!options.latestOnly,
						includeDeprecated: options.includeDeprecated,
						projectTypes: options.projectTypes,
						algoliaOptions: {
							attributesToRetrieve,
							filters
						}
					})
					.then(convertSteps)
					.catch(function(err: Error) {
						logger.error(err);
						return $q.reject(err);
					});
			},
			getStepVersions(stepId: string, attributesToRetrieve: string[]) {
				attributesToRetrieve = attributesToRetrieve || ["*"];

				return stepLibSearchInstance
					.list({
						query: stepId,
						includeInputs: true,
						algoliaOptions: {
							attributesToRetrieve: attributesToRetrieve
						}
					})
					.then(convertSteps)
					.then((stepObj: { [stepId: string]: StepVersion }) => stepObj[stepId])
					.catch((err: Error) => {
						logger.error(err);
						return $q.reject(err);
					});
			},
			fuzzySearch({
				attributesToRetrieve = ["*"],
				query,
				latestOnly,
				includeInputs,
				includeDeprecated
			}: FuzzySearchOptions) {
				return stepLibSearchInstance
					.list({
						query,
						latestOnly: !!latestOnly,
						includeInputs: !!includeInputs,
						includeDeprecated,
						algoliaOptions: {
							attributesToRetrieve,
							restrictSearchableAttributes: ["step.title"],
							typoTolerance: true
						}
					})
					.then(convertSteps)
					.catch(function(err: Error) {
						logger.error(err);
						return $q.reject(err);
					});
			}
		};
	}
);

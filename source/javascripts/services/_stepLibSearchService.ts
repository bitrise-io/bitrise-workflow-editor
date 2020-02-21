import { Step, SearchOptions } from "@bitrise/steplib-search";

type ListOptions = {
	attributesToRetrieve?: string[];
	stepCVSs: string[];
	includeInputs?: boolean;
	latestOnly?: boolean;
	projectTypes?: string[];
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

// @ts-ignore
angular.module("BitriseWorkflowEditor").service(
	"stepLibSearchService",
	($q: any, stepLibSearchInstance: StepLibSearchInstance): StepLibSearchService => {
		const convertSteps = (steps: StepVersion[]) =>
			steps.reduce((stepObj: object, stepVersion: StepVersion) => {
				var step = stepObj[stepVersion.id] || {};
				var versions = step.versions || {};
				versions[stepVersion.version] = Object.assign({}, stepVersion, stepVersion.info);

				var info = Object.assign({}, step.info, stepVersion.info);

				return Object.assign({}, stepObj, {
					[stepVersion.id]: {
						info: info,
						versions: versions
					}
				});
			}, {});

		return {
			list(options) {
				var attributesToRetrieve = options.attributesToRetrieve || ["*"];

				return stepLibSearchInstance
					.list({
						stepIds: options.stepCVSs,
						includeInputs: !!options.includeInputs,
						latestOnly: !!options.latestOnly,
						projectTypes: options.projectTypes,
						algoliaOptions: {
							attributesToRetrieve: attributesToRetrieve
						}
					})
					.then(convertSteps)
					.catch(function(err: any) {
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
					.catch((err: Error) => $q.reject(err));
			},
			fuzzySearch({ attributesToRetrieve, query, latestOnly, includeInputs }: FuzzySearchOptions) {
				attributesToRetrieve = attributesToRetrieve || ["*"];

				return stepLibSearchInstance
					.list({
						query,
						latestOnly: !!latestOnly,
						includeInputs: !!includeInputs,
						algoliaOptions: {
							attributesToRetrieve,
							restrictSearchableAttributes: ["step.title"],
							typoTolerance: true
						}
					})
					.then(convertSteps)
					.catch(function(err: any) {
						return $q.reject(err);
					});
			}
		};
	}
);

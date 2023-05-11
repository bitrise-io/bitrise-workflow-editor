(function() {
	"use strict";

	angular
		.module("BitriseWorkflowEditor")
		.factory("Stack", function($q, requestService) {
			var Stack = function(
				id,
				name,
				description,
				descriptionURL,
				descriptionURLGen2,
				descriptionURLGen2AppleSilicon,
				projectTypes,
				osForChip
			) {
				this.id = id;
				this.name = name;
				this.type = id.split("-")[0];
				this.description = description;
				this.descriptionURL = descriptionURL;
				this.descriptionURLGen2 = descriptionURLGen2;
				this.descriptionURLGen2AppleSilicon = descriptionURLGen2AppleSilicon;
				this.projectTypes = projectTypes;
				this.osForChip = osForChip;
			};

			Stack.all;
			Stack.invalidStacks = [];

			Stack.getAll = function(isCurrentUserOwner) {
				if (Stack.all) {
					return $q.when();
				}

				var stacksPromise = requestService.getStacks().then(function(data) {
					var stacks = _.map(data.stackDatas, function(aStackData) {
						return new Stack(
							aStackData.id,
							aStackData.name,
							aStackData.description,
							aStackData.descriptionURL,
							aStackData.descriptionURLGen2,
							aStackData.descriptionURLGen2AppleSilicon,
							aStackData.projectTypes,
							aStackData.osForChip
						);
					});
					return stacks;
				});

				var promises = [stacksPromise];

				if(isCurrentUserOwner) {
					var agentPoolPromise = requestService
						.getBetaTags()
						.then((betaTags) => {
							if(betaTags.includes('platform_admin')) {
								return requestService.getAgentPool().then((agentPool) => {
									return _.map(agentPool.pools, function(item) {
										return new Stack(
											item.id,
											item.name,
											"",
											"",
											undefined,
											undefined,
											[
												"ios",
												"osx",
												"macos",
												"android",
												"cordova",
												"ionic",
												"react-native",
												"flutter"
										],
											undefined
										);
									});
								})
							}
						})
						.catch(() => {
							return [];
						})
						promises.push(agentPoolPromise);
				}

				return $q.all(promises).then(([stacks, agentPool]) => {
					Stack.all = stacks.concat(agentPool);
					return Stack.all;
				})
			};

			Stack.getPotentiallyInvalidStack = function(stackId) {
				var stack = _.find(Stack.all, {
					id: stackId
				});
				if (stack) {
					return stack;
				}

				stack = _.find(Stack.invalidStacks, {
					id: stackId
				});
				if (!stack) {
					stack = new Stack(stackId, stackId);
					Stack.invalidStacks.push(stack);
				}

				return stack;
			}

			return Stack;
		});
})();

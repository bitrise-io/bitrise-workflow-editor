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
				projectTypes
			) {
				this.id = id;
				this.name = name;
				this.type = id.split("-")[0];
				this.description = description;
				this.descriptionURL = descriptionURL;
				this.descriptionURLGen2 = descriptionURLGen2;
				this.projectTypes = projectTypes;
			};

			Stack.all;

			Stack.getAll = function() {
				if (Stack.all) {
					return $q.when();
				}

				return requestService.getStacks().then(function(data) {
					Stack.all = _.map(data.stackDatas, function(aStackData) {
						return new Stack(
							aStackData.id,
							aStackData.name,
							aStackData.description,
							aStackData.descriptionURL,
							aStackData.descriptionURLGen2,
							aStackData.projectTypes
						);
					});
				});
			};

			return Stack;
		});
})();

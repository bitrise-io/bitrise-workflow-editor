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
				projectTypes
			) {
				this.id = id;
				this.name = name;
				this.description = description;
				this.descriptionURL = descriptionURL;
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
							aStackData.projectTypes
						);
					});
				});
			};

			return Stack;
		});
})();

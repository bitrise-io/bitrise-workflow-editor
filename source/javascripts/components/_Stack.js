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
        rollbackVersions
      ) {
        this.id = id;
        this.name = name;
        this.type = id.split("-")[0];
        this.description = description;
        this.descriptionURL = descriptionURL;
        this.descriptionURLGen2 = descriptionURLGen2;
        this.descriptionURLGen2AppleSilicon = descriptionURLGen2AppleSilicon;
        this.projectTypes = projectTypes;
        this.rollbackVersions = rollbackVersions;
      };

      Stack.all;
      Stack.invalidStacks = [];

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
              aStackData.descriptionURLGen2AppleSilicon,
              aStackData.projectTypes,
              aStackData.rollbackVersions
            );
          });
        });
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
      };

      Stack.prototype.isAgentPoolStack = function() {
        return this.id.startsWith("agent-pool-");
      };

      Stack.prototype.getRollbackVersion = function(machineType, isPaying) {
        return this.rollbackVersions && this.rollbackVersions[machineType] && this.rollbackVersions[machineType][isPaying ? "paying" : "free"];
      };

      return Stack;
    });
})();

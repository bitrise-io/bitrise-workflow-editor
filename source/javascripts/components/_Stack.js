(function () {
  angular.module('BitriseWorkflowEditor').factory('Stack', function ($q, requestService) {
    const Stack = function (
      id,
      name,
      description,
      descriptionURL,
      descriptionURLGen2,
      descriptionURLGen2AppleSilicon,
      projectTypes,
      rollbackVersions,
    ) {
      this.id = id;
      this.name = name;
      [this.type] = id.split('-');
      this.description = description;
      this.descriptionURL = descriptionURL;
      this.descriptionURLGen2 = descriptionURLGen2;
      this.descriptionURLGen2AppleSilicon = descriptionURLGen2AppleSilicon;
      this.projectTypes = projectTypes;
      this.rollbackVersions = rollbackVersions;
    };

    Stack.all = undefined;
    Stack.invalidStacks = [];

    Stack.getPotentiallyInvalidStack = function (stackId) {
      let stack = _.find(Stack.all, {
        id: stackId,
      });
      if (stack) {
        return stack;
      }

      stack = _.find(Stack.invalidStacks, {
        id: stackId,
      });
      if (!stack) {
        stack = new Stack(stackId, stackId);
        Stack.invalidStacks.push(stack);
      }

      return stack;
    };

    Stack.prototype.isAgentPoolStack = function () {
      return this.id.startsWith('agent-pool-');
    };

    Stack.prototype.getRollbackVersion = function (machineType, isPaying, accountSlug) {
      if (!this.rollbackVersions) {
        return;
      }
      if (!this.rollbackVersions[machineType]) {
        return;
      }
      if (this.rollbackVersions[machineType][accountSlug]) {
        return this.rollbackVersions[machineType][accountSlug];
      }

      return this.rollbackVersions[machineType][isPaying ? 'paying' : 'free'];
    };

    return Stack;
  });
})();

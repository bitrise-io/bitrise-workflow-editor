import { datadogRum } from '@datadog/browser-rum';

(function () {
  angular.module('BitriseWorkflowEditor').factory('Workflow', function (Step, Stack) {
    const BITRISE_META_KEY = 'bitrise.io';

    const Workflow = function (id, workflowConfig) {
      this.id = id;
      this.workflowConfig = workflowConfig;

      if (!this.workflowConfig) {
        return;
      }

      this.steps = _.map(workflowConfig.steps, function (aWrappedUserStepConfig) {
        const stepCVS = Step.cvsFromWrappedStepConfig(aWrappedUserStepConfig);
        const userStepConfig = aWrappedUserStepConfig[stepCVS];
        return new Step(stepCVS, userStepConfig);
      });
    };

    Workflow.isValidID = function (id) {
      if (id === undefined) {
        return undefined;
      }

      if (id.length === 0) {
        return false;
      }

      const validIDRegexp = /^[A-Za-z0-9-_.]+$/;

      return validIDRegexp.test(id);
    };

    Workflow.prototype.beforeRunWorkflows = function (allWorkflows) {
      return _.map(this.workflowConfig.before_run, function (aWorkflowID) {
        return _.find(allWorkflows, {
          id: aWorkflowID,
        });
      });
    };

    Workflow.prototype.afterRunWorkflows = function (allWorkflows) {
      return _.map(this.workflowConfig.after_run, function (aWorkflowID) {
        return _.find(allWorkflows, {
          id: aWorkflowID,
        });
      });
    };

    Workflow.prototype.workflowChain = function (allWorkflows) {
      let workflows = [];

      _.each(this.beforeRunWorkflows(allWorkflows), function (aWorkflow) {
        workflows = workflows.concat(aWorkflow.workflowChain(allWorkflows));
      });

      workflows.push(this);

      _.each(this.afterRunWorkflows(allWorkflows), function (aWorkflow) {
        workflows = workflows.concat(aWorkflow.workflowChain(allWorkflows));
      });

      return workflows;
    };

    Workflow.prototype.isLoopSafeRunForWorkflow = function (workflow, allWorkflows) {
      return !_.contains(this.workflowChain(allWorkflows), workflow);
    };

    Workflow.prototype.title = function (title) {
      if (title !== undefined) {
        this.workflowConfig.title = title || undefined;
      }

      return this.workflowConfig.title;
    };

    Workflow.prototype.description = function (description) {
      if (description !== undefined) {
        this.workflowConfig.description = description || undefined;
      }

      return this.workflowConfig.description;
    };

    Workflow.prototype.summary = function (summary) {
      if (summary !== undefined) {
        this.workflowConfig.summary = summary || undefined;
      }

      return this.workflowConfig.summary;
    };

    Workflow.prototype.stack = function (stack, defaultMachineTypeForStack) {
      if (stack !== undefined) {
        if (!this.workflowConfig.meta) {
          this.workflowConfig.meta = {};
        }
        if (!this.workflowConfig.meta[BITRISE_META_KEY]) {
          this.workflowConfig.meta[BITRISE_META_KEY] = {};
        }

        if (stack !== null) {
          this.workflowConfig.meta[BITRISE_META_KEY].stack = stack.id;

          if (stack.isAgentPoolStack()) {
            delete this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id;
          }

          if (defaultMachineTypeForStack) {
            this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id = defaultMachineTypeForStack.id;
          }
        } else {
          delete this.workflowConfig.meta[BITRISE_META_KEY].stack;
          delete this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id;
          delete this.workflowConfig.meta[BITRISE_META_KEY].stack_rollback_version;
        }

        if (_.isEmpty(this.workflowConfig.meta[BITRISE_META_KEY])) {
          delete this.workflowConfig.meta[BITRISE_META_KEY];
        }
        if (_.isEmpty(this.workflowConfig.meta)) {
          delete this.workflowConfig.meta;
        }
      }

      if (
        !this.workflowConfig.meta ||
        !this.workflowConfig.meta[BITRISE_META_KEY] ||
        !this.workflowConfig.meta[BITRISE_META_KEY].stack
      ) {
        return null;
      }

      return Stack.getPotentiallyInvalidStack(this.workflowConfig.meta[BITRISE_META_KEY].stack);
    };

    Workflow.prototype.machineType = function (stackType, machineType, machineTypes) {
      if (machineType !== undefined) {
        if (!this.workflowConfig.meta) {
          this.workflowConfig.meta = {};
        }
        if (!this.workflowConfig.meta[BITRISE_META_KEY]) {
          this.workflowConfig.meta[BITRISE_META_KEY] = {};
        }

        if (machineType !== null) {
          this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id = machineType.id;
        } else {
          delete this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id;
        }

        this.removeRollbackVersion();

        if (_.isEmpty(this.workflowConfig.meta[BITRISE_META_KEY])) {
          delete this.workflowConfig.meta[BITRISE_META_KEY];
        }
        if (_.isEmpty(this.workflowConfig.meta)) {
          delete this.workflowConfig.meta;
        }
      }

      if (
        !this.workflowConfig.meta ||
        !this.workflowConfig.meta[BITRISE_META_KEY] ||
        !this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id
      ) {
        return null;
      }

      return _.find(machineTypes, {
        id: this.workflowConfig.meta[BITRISE_META_KEY].machine_type_id,
        stackType,
      });
    };

    Workflow.prototype.setRollbackVersion = function (isPaying, accountSlug, machineTypes) {
      const stack = this.stack();

      if (!stack) {
        const error = new Error('Workflow.setRollbackVersion: can not set rollback version without stack');
        console.warn(error, stack);
        datadogRum.addError(error, { stack });
        return;
      }

      const machineType = this.machineType(stack.type, undefined, machineTypes);
      if (!machineType) {
        const error = new Error('Workflow.setRollbackVersion: can not get machine type');
        console.warn(error, { stack, machineTypes, meta: this.workflowConfig.meta });
        datadogRum.addError(error, { stack, machineTypes, meta: this.workflowConfig.meta });
        return;
      }

      if (!this.workflowConfig.meta) {
        this.workflowConfig.meta = {};
      }
      if (!this.workflowConfig.meta[BITRISE_META_KEY]) {
        this.workflowConfig.meta[BITRISE_META_KEY] = {};
      }

      this.workflowConfig.meta[BITRISE_META_KEY].stack_rollback_version = stack.getRollbackVersion(
        machineType.id,
        isPaying,
        accountSlug,
      );
    };

    Workflow.prototype.removeRollbackVersion = function () {
      if (!this.workflowConfig.meta) {
        this.workflowConfig.meta = {};
      }
      if (!this.workflowConfig.meta[BITRISE_META_KEY]) {
        this.workflowConfig.meta[BITRISE_META_KEY] = {};
      }

      delete this.workflowConfig.meta[BITRISE_META_KEY].stack_rollback_version;
    };

    Workflow.prototype.getRollbackVersion = function () {
      return (
        (this.workflowConfig.meta &&
          this.workflowConfig.meta[BITRISE_META_KEY] &&
          this.workflowConfig.meta[BITRISE_META_KEY].stack_rollback_version) ||
        null
      );
    };

    Workflow.prototype.isRollbackVersionInBitriseYmlNoLongerAvailable = function (machineTypes, isPaying, accountSlug) {
      const stack = this.stack();

      if (!stack) {
        return false;
      }

      const machineType = this.machineType(stack.type, undefined, machineTypes);
      if (!machineType) {
        const error = new Error('Workflow.isRollbackVersionInBitriseYmlNoLongerAvailable: can not get machine type');
        console.warn(error, { stack, machineTypes, meta: this.workflowConfig.meta });
        datadogRum.addError(error, { stack, machineTypes, meta: this.workflowConfig.meta });
        return false;
      }

      const rollbackVersion = stack.getRollbackVersion(machineType.id, isPaying, accountSlug);
      const rollbackVersionInYml = this.getRollbackVersion();

      return rollbackVersionInYml && !angular.equals(rollbackVersion, rollbackVersionInYml);
    };

    Workflow.prototype.licensePoolId = function (licensePoolId) {
      if (licensePoolId !== undefined) {
        if (!this.workflowConfig.meta) {
          this.workflowConfig.meta = {};
        }
        if (!this.workflowConfig.meta[BITRISE_META_KEY]) {
          this.workflowConfig.meta[BITRISE_META_KEY] = {};
        }

        if (licensePoolId !== null) {
          this.workflowConfig.meta[BITRISE_META_KEY].license_pool_id = licensePoolId;
        } else {
          delete this.workflowConfig.meta[BITRISE_META_KEY].license_pool_id;
        }

        if (_.isEmpty(this.workflowConfig.meta[BITRISE_META_KEY])) {
          delete this.workflowConfig.meta[BITRISE_META_KEY];
        }
        if (_.isEmpty(this.workflowConfig.meta)) {
          delete this.workflowConfig.meta;
        }
      }

      if (
        !this.workflowConfig.meta ||
        !this.workflowConfig.meta[BITRISE_META_KEY] ||
        !this.workflowConfig.meta[BITRISE_META_KEY].license_pool_id
      ) {
        return null;
      }

      return this.workflowConfig.meta[BITRISE_META_KEY].license_pool_id;
    };

    Workflow.prototype.envs = function (envs) {
      if (envs !== undefined) {
        if (Array.isArray(envs) && envs.length > 0) {
          this.workflowConfig.envs = envs;
        } else {
          this.workflowConfig.envs = undefined;
        }
      }

      return this.workflowConfig.envs;
    };

    return Workflow;
  });
})();

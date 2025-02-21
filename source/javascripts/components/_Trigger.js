(function () {
  angular.module('BitriseWorkflowEditor').factory('Trigger', function () {
    const Trigger = function (triggerConfig) {
      this.triggerConfig = triggerConfig || {};
    };

    Trigger.prototype.type = function (type) {
      if (type !== undefined) {
        delete this.triggerConfig.push_branch;
        delete this.triggerConfig.pull_request_source_branch;
        delete this.triggerConfig.pull_request_target_branch;
        delete this.triggerConfig.tag;

        switch (type) {
          case 'push':
            this.triggerConfig.push_branch = '';

            break;
          case 'pull-request':
            this.triggerConfig.pull_request_source_branch = '';
            this.triggerConfig.pull_request_target_branch = '';

            break;
          case 'tag':
            this.triggerConfig.tag = '';

            break;
        }
      }

      if (this.triggerConfig.push_branch !== undefined) {
        return 'push';
      }

      if (
        this.triggerConfig.pull_request_source_branch !== undefined ||
        this.triggerConfig.pull_request_target_branch !== undefined
      ) {
        return 'pull-request';
      }

      if (this.triggerConfig.tag !== undefined) {
        return 'tag';
      }
    };

    Trigger.prototype.target = function (target) {
      if (!target) {
        return `${this.targetType()}#${this.targetId()}`;
      }

      const parts = target.split('#');
      this.targetType(parts[0]);
      this.targetId(parts[1]);
    };

    Trigger.prototype.targetId = function (targetId) {
      if (!targetId) {
        return this.triggerConfig[this.targetType()];
      }

      this.triggerConfig[this.targetType()] = targetId;
    };

    Trigger.prototype.targetType = function (targetType) {
      if (!targetType) {
        return 'workflow' in this.triggerConfig ? 'workflow' : 'pipeline';
      }

      const target = this.targetId();
      delete this.triggerConfig[this.targetType()];
      this.triggerConfig[targetType] = target;
    };

    Trigger.prototype.pushBranchPattern = function (pushBranchPattern) {
      if (pushBranchPattern !== undefined) {
        if (this.type() !== 'push') {
          this.type('push');
        }

        this.triggerConfig.push_branch = pushBranchPattern || '*';
      }

      if (this.type() !== 'push') {
        return undefined;
      }

      return this.triggerConfig.push_branch;
    };

    Trigger.prototype.pullRequestSourceBranchPattern = function (pullRequestSourceBranchPattern) {
      if (pullRequestSourceBranchPattern !== undefined) {
        if (this.type() !== 'pull-request') {
          this.type('pull-request');
        }

        if (
          (!pullRequestSourceBranchPattern || pullRequestSourceBranchPattern === '*') &&
          this.triggerConfig.pull_request_target_branch
        ) {
          delete this.triggerConfig.pull_request_source_branch;
        } else {
          this.triggerConfig.pull_request_source_branch = pullRequestSourceBranchPattern || '*';
        }
      }

      if (this.type() !== 'pull-request') {
        return undefined;
      }

      return this.triggerConfig.pull_request_source_branch ? this.triggerConfig.pull_request_source_branch : '*';
    };

    Trigger.prototype.pullRequestTargetBranchPattern = function (pullRequestTargetBranchPattern) {
      if (pullRequestTargetBranchPattern !== undefined) {
        if (this.type() !== 'pull-request') {
          this.type('pull-request');
        }

        if (
          (!pullRequestTargetBranchPattern || pullRequestTargetBranchPattern === '*') &&
          this.triggerConfig.pull_request_source_branch
        ) {
          delete this.triggerConfig.pull_request_target_branch;
        } else {
          this.triggerConfig.pull_request_target_branch = pullRequestTargetBranchPattern || '*';
        }
      }

      if (this.type() !== 'pull-request') {
        return undefined;
      }

      return this.triggerConfig.pull_request_target_branch ? this.triggerConfig.pull_request_target_branch : '*';
    };

    Trigger.prototype.tagPattern = function (tagPattern) {
      if (tagPattern !== undefined) {
        if (this.type() !== 'tag') {
          this.type('tag');
        }

        this.triggerConfig.tag = tagPattern || '*';
      }

      if (this.type() !== 'tag') {
        return undefined;
      }

      return this.triggerConfig.tag;
    };

    return Trigger;
  });
})();

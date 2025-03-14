import { datadogRum } from '@datadog/browser-rum';
import PageProps from '@/core/utils/PageProps';

(function () {
  angular
    .module('BitriseWorkflowEditor')
    .controller(
      'StackController',
      function ($scope, $rootScope, appService, dateService, requestService, Stack, Workflow, MachineType) {
        const viewModel = this;

        viewModel.workflows = [];
        $scope.Stack = Stack;
        $scope.MachineType = MachineType;
        $scope.appService = appService;
        $scope.showMachineCreditCost = false;
        $scope.dateService = dateService;
        viewModel.buildMachineDeprecationData = undefined;
        viewModel.defaultDockerImagesByStackIDs = {
          'linux-docker-android': 'bitriseio/android-ndk:pinned',
          'linux-docker-android-20.04': 'bitriseio/android-ndk-20.04:pinned',
        };
        viewModel.machineTypeTagNotes = {
          gen1: 'The tried and tested machines that have been serving our customers for many years now',
          gen2: 'These machines run on a new hardware generation, offering improved performance compared to Gen1 hardware',
        };

        const machineUpgradeAnnouncementUrl =
          'https://docs.google.com/document/d/1aZw_nhce3qZus84qwUpoDGYtTdlSbYDnqd6E_WLVeow';

        const availableStacks = appService.availableStacks();
        if (!availableStacks) {
          const error = new Error('StackController: availableStacks is not available');
          console.warn(error.message, availableStacks);
          datadogRum.addError(error, { availableStacks });
        }

        viewModel.stackMachineMap = (availableStacks ?? []).reduce(function (result, stack) {
          if (!stack) {
            const error = new Error('StackController: stack is not a Stack instance');
            console.warn(error.message, stack);
            datadogRum.addError(error, { stack });
            return result;
          }

          const stackMachineTypes = _.filter(MachineType.all, function (machineType) {
            if (machineType.availableOnStacks) {
              return machineType.availableOnStacks.indexOf(stack.id) > -1;
            }
            return machineType.stackType === stack.type;
          });

          if (stack.type === 'osx') {
            result[stack.id] = _.groupBy(stackMachineTypes, 'chip');
          } else {
            result[stack.id] = _.groupBy(stackMachineTypes, 'tag');
          }

          return result;
        }, {});

        viewModel.getStackMachineTypeGroupIds = function (stackId) {
          if (viewModel.stackMachineMap) {
            return Object.keys(viewModel.stackMachineMap[stackId] || {}).sort();
          }
          return [];
        };

        viewModel.canShowDefaulStackMachines = function () {
          if (appService.stack && appService.stack.isAgentPoolStack()) {
            return false;
          }

          return appService.appDetails.isMachineTypeSelectorAvailable;
        };

        viewModel.canShowWorkflowStackMachines = function (workflow) {
          const stack = viewModel.stackGetterSetterForWorkflow(workflow, false)();

          if (stack && stack.isAgentPoolStack()) {
            return false;
          }

          if (!appService.appDetails.isMachineTypeSelectorAvailable) {
            return false;
          }

          return !!stack || !!viewModel.workflowMachineType(workflow, false);
        };

        viewModel.isDisabledRollbackVersion = function () {
          return !appService.getStackRollbackVersion();
        };

        viewModel.isCheckedRollbackVersion = function () {
          return !!appService.rollbackVersion;
        };

        viewModel.onChangeRollbackVersion = function (isChecked) {
          if (isChecked === true) {
            appService.rollbackVersion = appService.getStackRollbackVersion();
            $scope.$apply();
          } else if (isChecked === false) {
            appService.rollbackVersion = undefined;
            $scope.$apply();
          }
        };

        viewModel.isRollbackVersionInBitriseYmlNoLongerAvailable = function () {
          const isPaying = appService.isOwnerPaying();
          const machineTypeId = appService.defaultMachineType.id;

          const isStackChanged = appService.savedStack.id !== appService.stack.id;

          const rollbackVersion = appService.stack.getRollbackVersion(
            appService.savedDefaultMachineType.id,
            isPaying,
            appService.appDetails.ownerData.slug,
          );
          const rollbackVersionInYml = appService.getRollbackVersionFromBitriseYml();

          const hasUnsavedChanges =
            appService.rollbackVersionHasUnsavedChanges() ||
            appService.stackHasUnsavedChanges() ||
            appService.defaultMachineTypeHasUnsavedChanges();

          return !hasUnsavedChanges && rollbackVersionInYml && !angular.equals(rollbackVersion, rollbackVersionInYml);
        };

        viewModel.isDisabledRollbackVersionForWorkflow = function (workflow) {
          return !appService.getStackRollbackVersion(workflow);
        };

        viewModel.isCheckedRollbackVersionForWorkflow = function (listItemId) {
          const workflow = _.find(viewModel.workflows, {
            id: listItemId,
          });

          const isRollbackVersionInYmlNotAvailable = workflow.isRollbackVersionInBitriseYmlNoLongerAvailable(
            MachineType.all,
            appService.isOwnerPaying(),
            appService.appDetails.ownerData.slug,
          );
          return !!workflow.getRollbackVersion() && !isRollbackVersionInYmlNotAvailable;
        };

        viewModel.onChangeRollbackVersionForWorkflow = function (isChecked, listItemId) {
          const workflow = _.find(viewModel.workflows, {
            id: listItemId,
          });

          if (isChecked === true) {
            const isPaying = appService.isOwnerPaying();

            workflow.setRollbackVersion(isPaying, appService.appDetails.ownerData.slug, MachineType.all);
            $scope.$apply();
          } else if (isChecked === false) {
            workflow.removeRollbackVersion();
            $scope.$apply();
          }
        };

        viewModel.isRollbackVersionInBitriseYmlNoLongerAvailableForWorkflow = function (workflow) {
          const isPaying = appService.isOwnerPaying();
          const machineTypeId = appService.defaultMachineType.id;

          return workflow.isRollbackVersionInBitriseYmlNoLongerAvailable(
            MachineType.all,
            isPaying,
            appService.appDetails.ownerData.slug,
          );
        };

        viewModel.init = function () {
          appService
            .getOwnerPlanData()
            .then(() => {
              $scope.showMachineCreditCost = getShowMachineCreditCost();
              configure();

              appService.setRollbackVersionFromBitriseYml();
            })
            .catch(() => {
              $scope.showMachineCreditCost = getShowMachineCreditCost();
              configure();
            });

          requestService.getApp(PageProps.appSlug()).then((response) => {
            const gracePeriodDates = {};
            if (
              response.deprecated_machines_replacement_config &&
              response.deprecated_machines_replacement_config.grace_period_started_at
            ) {
              gracePeriodDates.startsAt = new Date(
                response.deprecated_machines_replacement_config.grace_period_started_at,
              );
            }
            if (
              response.deprecated_machines_replacement_config &&
              response.deprecated_machines_replacement_config.grace_period_ended_at
            ) {
              gracePeriodDates.endsAt = new Date(response.deprecated_machines_replacement_config.grace_period_ended_at);
            }
            viewModel.buildMachineDeprecationData = buildMachineDeprecationDataBasedOnGracePeriodDates(
              gracePeriodDates.startsAt,
              gracePeriodDates.endsAt,
            );
          });
        };

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::discardChanges', function () {
            configure();
          }),
        );

        function configure() {
          viewModel.workflows = Object.keys(appService.appConfig.workflows)
            .filter(function (workflowID) {
              return !workflowID.startsWith('_');
            })
            .map(function (workflowID) {
              const aWorkflowConfig = appService.appConfig.workflows[workflowID];
              return new Workflow(workflowID, aWorkflowConfig);
            });
        }

        function buildMachineDeprecationDataBasedOnGracePeriodDates(startDate, endDate) {
          if (!startDate || !endDate) {
            return;
          }

          const currentDate = new Date();
          if (currentDate < startDate) {
            return {
              message: `Upgrading to faster Pro Medium/Large/X Large, with no extra costs. Medium/Large/X Large machines will be deprecated and your Workflows will automatically run on Pro Medium/Large/X Large machines from the ${dateService.toLocaleMonthDayDateString(startDate)}.`,
              linkUrl: machineUpgradeAnnouncementUrl,
              linkLabel: 'Read announcement.',
            };
          }
          if (currentDate >= startDate && currentDate <= endDate) {
            return {
              message: `Your Workflows were automatically switched to faster Pro Medium/Large/X Large, with no extra costs. To continue using the deprecated Medium/Large/X Large machines until the ${dateService.toLocaleMonthDayDateString(endDate)}, opt to extend the transition period in the`,
              linkUrl: `/workspaces/${appService.appDetails.ownerData.slug}/settings/apps`,
              linkLabel: 'Workspace settings.',
            };
          }
          if (currentDate > endDate) {
            return {
              message:
                'Your Workflows are now running on faster Pro Medium/Large/X Large, with no extra costs. If you’d like to keep using the deprecated Medium/Large/X Large machines, reach out to support.',
              linkUrl: machineUpgradeAnnouncementUrl,
              linkLabel: 'Read announcement.',
            };
          }
        }

        viewModel.stackOptionTitle = function (stack) {
          if (stack === null) {
            return `Default (${viewModel.stackOptionTitle(appService.stack)})`;
          }

          return stack.name || stack.id;
        };

        viewModel.stackOptions = function () {
          const stacks = appService.availableStacks().concat(Stack.invalidStacks);

          return stacks;
        };

        viewModel.onDefaultStackChange = function () {
          appService.dockerImage = viewModel.defaultDockerImagesByStackIDs[appService.stack.id] ? '' : null;

          if (appService.stack.isAgentPoolStack()) {
            return;
          }

          const isPreviousMachineTypeAvailable = viewModel.isMachineTypeAvailableForStack(
            appService.defaultMachineType,
            appService.stack,
          );

          if (!isPreviousMachineTypeAvailable) {
            viewModel.setDefaultMachineType(viewModel.firstAvailableMachineTypeForStack(appService.stack.id));
          }

          appService.rollbackVersion = undefined;
          appService.setRollbackVersionFromBitriseYml();
        };

        viewModel.stackGetterSetterForWorkflow = function (workflow, shouldNormalize) {
          if (shouldNormalize === undefined) {
            shouldNormalize = false;
          }

          return function (stack) {
            if (stack === null && shouldNormalize) {
              stack = appService.stack;
            }

            let defaultMachineTypeForStack;
            if (stack) {
              const previousMachineType = viewModel.workflowMachineType(workflow);
              const isPreviousMachineTypeAvailable = viewModel.isMachineTypeAvailableForStack(
                previousMachineType,
                stack,
              );

              if (isPreviousMachineTypeAvailable) {
                defaultMachineTypeForStack = previousMachineType;
              } else if (MachineType.defaults) {
                defaultMachineTypeForStack = MachineType.defaults[stack.type];
              }
            }
            stack = workflow.stack(stack, defaultMachineTypeForStack);

            if (stack === null && shouldNormalize) {
              return appService.stack;
            }

            if (!stack) {
              const error = new Error('StackController.stackGetterSetterForWorkflow: stack is not a Stack instance');
              console.warn(error.message, stack);
              datadogRum.addError(error, { stack });
            }

            return stack;
          };
        };

        viewModel.setDefaultMachineType = function (machineType) {
          if (machineType && !machineType.isAvailable) {
            return;
          }

          appService.defaultMachineType = machineType;
          if (machineType.id === appService.savedDefaultMachineType.id) {
            appService.setRollbackVersionFromBitriseYml();
          } else {
            viewModel.onChangeRollbackVersion(false);
          }
        };

        viewModel.setWorkflowMachineType = function (machineType, workflow) {
          if (!machineType.isAvailable) {
            return;
          }

          const stack = viewModel.stackGetterSetterForWorkflow(workflow, true)();
          workflow.machineType(stack.type, machineType, MachineType.all);
        };

        viewModel.workflowMachineType = function (workflow, shouldNormalize = true) {
          const stack = viewModel.stackGetterSetterForWorkflow(workflow, true)();
          const workflowMachineType = workflow.machineType(stack.type, undefined, MachineType.all);

          if (workflowMachineType || !shouldNormalize) {
            return workflowMachineType;
          }

          return appService.defaultMachineType;
        };

        viewModel.isMachineTypeAvailableForStack = function (previousMachineType, stack) {
          return Object.values(viewModel.stackMachineMap[stack.id] || {}).some((machineTypes) =>
            machineTypes.some(
              (machineType) =>
                machineType.id === (previousMachineType || {}).id && machineType.type === previousMachineType.type,
            ),
          );
        };

        viewModel.firstAvailableMachineTypeForStack = function (selectedStackId) {
          return _.find(MachineType.all, function (aMachineType) {
            return _.contains(aMachineType.availableOnStacks, selectedStackId);
          });
        };

        viewModel.descriptionURLForStack = function (stack) {
          if (stack.descriptionURLGen2 !== undefined) {
            return stack.descriptionURLGen2;
          }

          return stack.descriptionURL;
        };

        viewModel.hasDescriptionURLForStack = function (stack) {
          return !!viewModel.descriptionURLForStack(stack);
        };

        function getShowMachineCreditCost() {
          if (appService.ownerPlanData) {
            return appService.ownerPlanData.creditBased;
          }
          return true;
        }
      },
    );
})();

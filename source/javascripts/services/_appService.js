import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

(function () {
  angular
    .module('BitriseWorkflowEditor')
    .service('appService', function ($q, requestService, stringService, Step, Stack, Trigger, Variable, MachineType) {
      const appService = {
        // JSON objects
        appConfig: undefined,
        savedAppConfig: undefined,
        savedAppConfigVersion: undefined,
        remoteAppConfig: undefined,
        // YML strings
        appConfigYML: undefined,
        savedAppConfigYML: undefined,
        savedAppConfigYMLVersion: undefined,

        appDetails: undefined,
        secrets: undefined,
        savedSecrets: undefined,
        stack: undefined,
        savedStack: undefined,
        defaultMachineType: undefined,
        savedDefaultMachineType: undefined,
        rollbackVersion: undefined,
        savedRollbackVersion: undefined,
        dockerImage: undefined,
        savedDockerImage: undefined,
        projectType: undefined,
        accountData: undefined,
        pipelineConfig: undefined,
        accountFeatures: undefined,
        hasTriggers: undefined,
        ownerPlanData: undefined,
        orgBetaTags: undefined,
      };

      appService.getAppDetails = function (shouldForceReload, requestConfig) {
        if (!shouldForceReload && appService.appDetails) {
          return $q.when();
        }

        return $q(function (resolve, reject) {
          requestService.getAppDetails(requestConfig).then(
            function (appDetails) {
              appService.appDetails = appDetails;

              resolve();
            },
            function (error) {
              appService.appDetails = {
                slug: PageProps.appSlug() ?? '',
              };

              reject(error);
            },
          );
        });
      };

      appService.getAppConfig = function (shouldForceReload, requestConfig) {
        if (!shouldForceReload && appService.appConfig) {
          return $q.when();
        }

        return requestService.getAppConfig(requestConfig).then(function ({ version, content }) {
          appService.appConfig = normalizeAppConfig(content);
          appService.savedAppConfig = angular.copy(appService.appConfig);
          appService.savedAppConfigVersion = version;
        });
      };

      appService.appConfigHasUnsavedChanges = function () {
        return !angular.equals(appService.appConfig, appService.savedAppConfig);
      };

      function normalizeAppConfig(configToNormalize) {
        let variableConfigs = [];
        const config = angular.copy(configToNormalize);

        if (config.app && config.app.envs) {
          variableConfigs = _.union(variableConfigs, config.app.envs);
        }

        if (config.services) {
          _.each(config.services, function (aServiceConfig) {
            if (aServiceConfig.credentials && _.isEmpty(aServiceConfig.credentials)) {
              delete aServiceConfig.credentials;
            }
          });
        }

        if (config.containers) {
          _.each(config.containers, function (aContainerConfig) {
            if (aContainerConfig.credentials && _.isEmpty(aContainerConfig.credentials)) {
              delete aContainerConfig.credentials;
            }
          });
        }

        if (config.pipelines) {
          _.each(config.pipelines, function (aPipelineConfig) {
            if (aPipelineConfig.triggers && _.isEmpty(aPipelineConfig.triggers)) {
              delete aPipelineConfig.triggers;
            }

            if (aPipelineConfig.workflows) {
              _.each(aPipelineConfig.workflows, function (aWorkflowConfig) {
                if (aWorkflowConfig.run_if && _.isEmpty(aWorkflowConfig.run_if)) {
                  delete aWorkflowConfig.run_if;
                }
              });
            }
          });
        }

        if (config.workflows) {
          _.each(config.workflows, function (aWorkflowConfig, aWorkflowID) {
            if (!aWorkflowConfig) {
              config.workflows[aWorkflowID] = aWorkflowConfig = {};
            }

            variableConfigs = _.union(variableConfigs, aWorkflowConfig.envs);

            if (aWorkflowConfig.steps !== undefined && _.isEmpty(aWorkflowConfig.steps)) {
              delete aWorkflowConfig.steps;
            }

            _.each(aWorkflowConfig.steps, function (aWrappedUserStepConfig) {
              const stepCVS = Step.cvsFromWrappedStepConfig(aWrappedUserStepConfig);
              if (!aWrappedUserStepConfig[stepCVS]) {
                aWrappedUserStepConfig[stepCVS] = {};
              }
              const stepConfig = aWrappedUserStepConfig[stepCVS];

              if (stepConfig.source && _.isEmpty(stepConfig.source)) {
                delete stepConfig.source;
              }

              if (stepConfig.deps && _.isEmpty(stepConfig.deps)) {
                delete stepConfig.deps;
              }

              variableConfigs = _.union(variableConfigs, stepConfig.inputs);
            });

            if (aWorkflowConfig.triggers && _.isEmpty(aWorkflowConfig.triggers)) {
              delete aWorkflowConfig.triggers;
            }
          });
        }

        _.each(config.step_bundles, function (aStepBundleConfig, aStepBundleID) {
          if (!aStepBundleConfig) {
            config.workflows[aStepBundleID] = aStepBundleConfig = {};
          }

          variableConfigs = _.union(variableConfigs, aStepBundleConfig.envs);

          if (aStepBundleConfig.steps !== undefined && _.isEmpty(aStepBundleConfig.steps)) {
            delete aStepBundleConfig.steps;
          }

          _.each(aStepBundleConfig.steps, function (aWrappedUserStepConfig) {
            const stepCVS = Step.cvsFromWrappedStepConfig(aWrappedUserStepConfig);
            if (!aWrappedUserStepConfig[stepCVS]) {
              aWrappedUserStepConfig[stepCVS] = {};
            }
            const stepConfig = aWrappedUserStepConfig[stepCVS];

            if (stepConfig.source && _.isEmpty(stepConfig.source)) {
              delete stepConfig.source;
            }

            if (stepConfig.deps && _.isEmpty(stepConfig.deps)) {
              delete stepConfig.deps;
            }

            variableConfigs = _.union(variableConfigs, stepConfig.inputs);
          });
        });

        _.each(variableConfigs, Variable.minimizeVariableConfig);

        if (config.app) {
          if (config.app.envs && config.app.envs.length === 0) {
            delete config.app.envs;
          }

          if (angular.equals(config.app, {})) {
            delete config.app;
          }
        }

        if (config.trigger_map) {
          appService.hasTriggers = config.trigger_map.length > 0;
          if (appService.hasTriggers) {
            config.trigger_map = _.sortBy(config.trigger_map, function (aTriggerConfig) {
              const trigger = new Trigger(aTriggerConfig);
              return _.indexOf(['push', 'pull-request', 'tag'], trigger.type());
            });
          } else {
            delete config.trigger_map;
          }
        }

        if (config.workflows && angular.equals(config.workflows, {})) {
          delete config.workflows;
        }

        return config;
      }

      function validateVariables(variables, shouldKeysBeUnique, shouldValuesBeNotEmpty) {
        return $q(function (resolve, reject) {
          const errors = [];

          if (
            _.any(variables, function (aVariable) {
              return !Variable.isValidKey(aVariable.key(), shouldKeysBeUnique ? variables : null);
            })
          ) {
            errors.push(
              new Error(
                'one or more Environment Variable has an invalid key. Keys should not be empty, should only contain uppercase, lowercase letters, numbers, underscores, should not begin with a number',
              ),
            );

            if (shouldKeysBeUnique) {
              errors.push(new Error('should be unique'));
            }
          }

          if (
            _.any(variables, function (aVariable) {
              return !Variable.isValidValue(aVariable.value(), shouldValuesBeNotEmpty);
            })
          ) {
            errors.push(new Error('invalid Environment Variable value. Should not be empty'));
          }

          if (errors.length === 0) {
            resolve();
          } else {
            reject(new Error(stringService.errorMessageFromErrors(errors)));
          }
        });
      }

      appService.validateAppConfig = function () {
        let variables = [];
        // Remove empty app env vars
        if (appService.appConfig.app && appService.appConfig.app.envs) {
          const variablesWithoutKeyAndValue = _.filter(
            _.map(appService.appConfig.app.envs, function (anEnvVarConfig) {
              return new Variable(anEnvVarConfig, Variable.defaultVariableConfig());
            }),
            function (anEnvVar) {
              return _.isEmpty(anEnvVar.key()) && _.isEmpty(anEnvVar.value());
            },
          );

          _.each(variablesWithoutKeyAndValue, function (aVariable) {
            const index = _.findIndex(appService.appConfig.app.envs, aVariable.userVariableConfig);
            appService.appConfig.app.envs.splice(index, 1);
          });

          variables = variables.concat(
            _.map(appService.appConfig.app.envs, function (anEnvVarConfig) {
              return new Variable(anEnvVarConfig, Variable.defaultVariableConfig());
            }),
          );
        }

        // Remove empty workflow env vars
        if (appService.appConfig.workflows) {
          _.each(appService.appConfig.workflows, function (aWorkflowConfig) {
            const variablesWithoutKeyAndValue = _.filter(
              _.map(aWorkflowConfig.envs, function (anEnvVarConfig) {
                return new Variable(anEnvVarConfig, Variable.defaultVariableConfig());
              }),
              function (anEnvVar) {
                return _.isEmpty(anEnvVar.key()) && _.isEmpty(anEnvVar.value());
              },
            );

            _.each(variablesWithoutKeyAndValue, function (aVariable) {
              const index = _.findIndex(aWorkflowConfig.envs, aVariable.userVariableConfig);
              aWorkflowConfig.envs.splice(index, 1);
            });

            variables = variables.concat(
              _.map(aWorkflowConfig.envs, function (anEnvVarConfig) {
                return new Variable(anEnvVarConfig, Variable.defaultVariableConfig());
              }),
            );
          });
        }

        // Populate the meta with the default machine type if necessary
        if (
          RuntimeUtils.isWebsiteMode() &&
          appService.appDetails.isMachineTypeSelectorAvailable &&
          appService.defaultMachineType
        ) {
          if (!appService.appConfig.meta) {
            appService.appConfig.meta = {};
          }
          if (!appService.appConfig.meta['bitrise.io']) {
            appService.appConfig.meta['bitrise.io'] = {};
          }

          if (appService.stack && appService.stack.isAgentPoolStack()) {
            delete appService.appConfig.meta['bitrise.io'].machine_type_id;
          } else {
            appService.appConfig.meta['bitrise.io'].machine_type_id = appService.defaultMachineType.id;
          }

          appService.savedDefaultMachineType = angular.copy(appService.defaultMachineType);
        }

        return validateVariables(variables);
      };

      appService.saveAppConfig = function (tabOpenDuringSave, appConfig, version) {
        let requestConfig;
        if (version || appService.savedAppConfigVersion) {
          requestConfig = {
            headers: {
              [requestService.appConfigVersionHeaderName]: version || appService.savedAppConfigVersion,
            },
          };
        }

        return requestService.postAppConfig(appConfig, tabOpenDuringSave, requestConfig).then(function () {
          appService.hasTriggers = Boolean(appConfig.trigger_map?.length);
        });
      };

      appService.discardAppConfigChanges = function () {
        appService.appConfig = angular.copy(appService.savedAppConfig);
      };

      appService.getPipelineConfig = function (shouldForceReload, requestConfig) {
        if (!shouldForceReload && appService.pipelineConfig) {
          return $q.when();
        }

        return requestService.getPipelineConfig(requestConfig).then(function (pipelineConfig) {
          appService.pipelineConfig = pipelineConfig;
        });
      };

      appService.getSecretValue = function (secret, requestConfig) {
        if (!_.isNull(secret.value()) && appService.secrets) {
          return $q.when();
        }

        return requestService.getSecretValue(secret, requestConfig).then(function (secretValue) {
          secret.value(secretValue);

          const savedEnvVar = _.find(appService.savedSecrets, function (aSavedSecret) {
            return aSavedSecret.key() === secret.key();
          });
          savedEnvVar.value(secretValue);
        });
      };

      appService.saveSecrets = function () {
        appService.secrets = appService.secrets.filter(
          (aSecretVar) => !_.isEmpty(aSecretVar.key()) || !_.isEmpty(aSecretVar.value()),
        );
        appService.secrets
          .filter((s) => s.scope() !== 'workspace')
          .forEach((aSecretVar) => {
            aSecretVar.isKeyChangeable = false;
            aSecretVar.shouldShowValue = false;
            if (aSecretVar.isProtected()) {
              aSecretVar.value(null);
            }
          });
        appService.savedSecrets = angular.copy(appService.secrets);
      };

      appService.getAppConfigYML = function (shouldForceReload, requestConfig) {
        if (!shouldForceReload && appService.appConfigYML) {
          return $q.when();
        }

        return requestService.getAppConfigYML(requestConfig).then(
          function ({ version, content }) {
            appService.appConfigYML = content;
            appService.savedAppConfigYML = content;
            appService.savedAppConfigYMLVersion = version;
          },
          function (response) {
            if (response.bitriseYml) {
              appService.appConfigYML = response.bitriseYml;
              appService.savedAppConfigYML = response.bitriseYml;
            }

            return $q.reject(response);
          },
        );
      };

      appService.appConfigYMLHasUnsavedChanges = function () {
        return !angular.equals(appService.appConfigYML, appService.savedAppConfigYML);
      };

      appService.saveAppConfigYML = function (tabOpenDuringSave, appConfigYML, version) {
        let requestConfig;
        if (version || appService.savedAppConfigYMLVersion) {
          requestConfig = {
            headers: {
              [requestService.appConfigVersionHeaderName]: version || appService.savedAppConfigYMLVersion,
            },
          };
        }

        return requestService.postAppConfigYML(appConfigYML, requestConfig);
      };

      appService.discardAppConfigYMLChanges = function () {
        appService.appConfigYML = angular.copy(appService.savedAppConfigYML);
      };

      appService.getOwnerPlanData = function () {
        if (appService.ownerPlanData) {
          return $q.when();
        }

        if (RuntimeUtils.isWebsiteMode() && appService.appDetails.ownerData && appService.appDetails.ownerData.slug) {
          return requestService
            .getOrgPlanData(appService.appDetails.ownerData.slug)
            .then(function (ownerPlanData) {
              appService.ownerPlanData = ownerPlanData;
            })
            .catch(() => {
              appService.ownerPlanData = null;
            });
        }
        appService.ownerPlanData = null;
        return $q.when();
      };

      appService.getOrgBetaTags = function () {
        if (appService.orgBetaTags) {
          return $q.when();
        }

        if (RuntimeUtils.isWebsiteMode()) {
          return requestService
            .getOrgBetaTags(appService.appDetails.ownerData.slug)
            .then(function (data) {
              appService.orgBetaTags = data.beta_tags;
            })
            .catch(() => {
              appService.orgBetaTags = null;
            });
        }
        appService.orgBetaTags = null;
        return $q.when();
      };

      appService.getNormalizedAppConfig = function (requestConfig) {
        return requestService.getAppConfig(requestConfig).then(function ({ version, content }) {
          return {
            version,
            content: normalizeAppConfig(content),
          };
        });
      };

      return appService;
    });
})();

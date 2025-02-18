// eslint-disable-next-line import/no-extraneous-dependencies

(function () {
  angular
    .module('BitriseWorkflowEditor')
    .service('requestService', function ($q, $injector, $http, RequestService, stringService, dateService, logger) {
      const requestService = {
        mode: RequestService.mode,
        appSlug: RequestService.appSlug,
        appConfigVersionHeaderName: RequestService.appConfigVersionHeaderName,
      };

      requestService.isWebsiteMode = function () {
        return RequestService.isWebsiteMode();
      };

      function errorFromResponse(response, defaultErrorMessage, errorMessagePrefix) {
        const status = response && response.status;

        if (status === -1 || status === 408) {
          return new Error(`${response.config.method.toUpperCase()} ${response.config.url} - Request aborted`);
        }

        const messageTags = {
          status,
        };

        const error = new Error(defaultErrorMessage);
        error.status = status;

        if (response && response.data) {
          if (response.data.error_msg) {
            error.message = response.data.error_msg;
          } else if (response.data.error) {
            error.message = response.data.error;
          } else if (response.data.message) {
            error.message = response.data.message;
          } else if (response.data.errors) {
            let errors;

            if (angular.isArray(response.data.errors)) {
              if (angular.isString(response.data.errors[0])) {
                errors = _.map(response.data.errors, function (anErrorMessage) {
                  return new Error(anErrorMessage);
                });
              } else {
                errors = _.map(response.data.errors, function (anErrorMap) {
                  const err = new Error(anErrorMap.message);
                  err.name = anErrorMap.type;
                  return err;
                });
              }
            } else if (angular.isObject(response.data.errors)) {
              errors = _.map(_.flatten(_.values(response.data.errors)), function (anErrorMessage) {
                return new Error(anErrorMessage);
              });
            }

            error.name = _.pluck(errors, 'name').join();
            error.message = stringService.errorMessageFromErrors(errors);
          }
        }

        if (errorMessagePrefix && error.message !== defaultErrorMessage) {
          error.message = errorMessagePrefix += error.message;
        }

        if (status < 500) {
          logger.warn(error.message, messageTags);
        } else {
          logger.error(error, messageTags);
        }

        return error;
      }

      requestService.localServerPath = function (path) {
        if (process.env.MODE !== 'CLI') {
          return 'not_available';
        }
        return path;
      };

      requestService.webServerPath = function (path) {
        if (process.env.MODE !== 'WEBSITE') {
          return 'not_available';
        }
        return path;
      };

      // Connection

      requestService.cancelAPIConnectionClose = function (requestConfig) {
        return $http.post(requestService.localServerPath('/api/connection'), undefined, requestConfig);
      };

      requestService.closeAPIConnection = function () {
        return $.ajax({
          type: 'DELETE',
          url: requestService.localServerPath('/api/connection'),
          async: false,
        });
      };

      // Current User

      requestService.getCurrentUserMetadata = function (metadataKey, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/me/profile/metadata.json?key=${metadataKey}`);
            break;
          case 'cli':
            return $q.reject(new Error('Getting current user metadata is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(response.data.value);
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error getting current user metadata',
                  'Error getting current user metadata: ',
                ),
              );
            },
          );
        });
      };

      requestService.updateCurrentUserMetadata = function (metadataKeyValue, requestConfig) {
        let requestURL;
        let requestData;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath('/me/profile/metadata.json');

            requestData = { ...metadataKeyValue };

            break;
          case 'cli':
            return $q.reject(new Error('Updating current user metadata is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.put(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve(response);
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error updating current user metadata',
                  'Error updating current user metadata: ',
                ),
              );
            },
          );
        });
      };

      requestService.getOrgPlanData = function (orgSlug, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/organization/${orgSlug}/payment_subscription_status`);
            break;
          case 'cli':
            return $q.reject(new Error('Getting organization subscription status is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve({
                id: response.data.current_plan.id,
                name: response.data.current_plan.name,
                tier: response.data.current_plan.tier,
                creditBased: response.data.current_plan.credit_based,
                uniqueStepLimit: response.data.unique_step_limit,
                repositoryYmlAvailable: response.data.repository_yml_available,
                sharedResourcesAvailable: response.data.current_limits.shared_resources_available,
              });
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error getting organization subscription status',
                  'Error getting organization subscription status: ',
                ),
              );
            },
          );
        });
      };

      requestService.getOrgBetaTags = function (orgSlug, requestConfig) {
        const requestURL = requestService.webServerPath(`/organization/${orgSlug}/beta_tags`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve({
                beta_tags: response.data.beta_tags,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'default_error', 'error_prefix'));
            },
          );
        });
      };

      // App details

      requestService.getAppDetails = function (requestConfig) {
        switch (requestService.mode) {
          case 'website': {
            const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}.json`);

            return $q(function (resolve, reject) {
              $http.get(requestURL, requestConfig).then(
                function (response) {
                  resolve({
                    avatarURL: response.data.avatar_icon_url,
                    slug: response.data.slug,
                    title: response.data.title,
                    projectTypeID: response.data.project_type,
                    providerID: response.data.provider,
                    repositoryURL: response.data.url,
                    stack: response.data.stack_identifier,
                    isPublic: response.data.is_public,
                    isCurrentUserOwner: response.data.owner_is_current_user,
                    isCurrentUserIsOrgOwner: response.data.is_current_user_can_destroy,
                    isMachineTypeSelectorAvailable: response.data.is_machine_type_selector_available,
                    appMachineTypeIdWithoutDeprecatedMachineReplacement:
                      response.data.app_machine_type_id_without_deprecated_machine_replacement,
                    ownerData: {
                      slug: response.data.owner_slug,
                      type: response.data.owner_type,
                      name:
                        response.data.owner_type === 'User' ? response.data.owner_username : response.data.owner_name,
                      isPaying: response.data.owner_is_paying,
                    },
                    buildData: {
                      lastRunningBuildOrLastBuildStatus: response.data.last_running_build_or_last_build_build_status,
                      lastRunningBuildFinishDate: response.data.last_running_build_or_last_build_finished_at,
                    },
                    defaultBranch: response.data.default_branch_name,
                    gitRepoSlug: response.data.git_repo_slug,
                  });
                },
                function (response) {
                  reject(errorFromResponse(response, 'Error loading app data.', 'Error loading app data: '));
                },
              );
            });
          }
          case 'cli': {
            return $q.reject(new Error('Saving Apple Credential User for app is only available in website mode'));
          }
        }
      };

      // App config

      requestService.postAppConfig = function (appConfig, tabOpenDuringSave, requestConfig) {
        let requestURL;
        let requestData;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/config.json`);
            requestData = {
              app_config_datastore_yaml: appConfig,
              tab_open_during_save: tabOpenDuringSave,
            };

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/bitrise-yml.json');
            requestData = {
              bitrise_yml: appConfig,
            };

            break;
        }

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve(response.data);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error saving CI config.', 'Error saving CI config: '));
            },
          );
        });
      };

      requestService.getAppConfig = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/config.json`);

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/bitrise-yml.json');

            break;
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              const version = response.headers(requestService.appConfigVersionHeaderName);
              const content = response.data;

              resolve({ version, content });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading app config.', 'Error loading app config: '));
            },
          );
        });
      };

      // App config YML

      requestService.postAppConfigYML = function (appConfigYML, requestConfig) {
        let requestURL;
        let requestData;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/config.json`);
            requestData = {
              app_config_datastore_yaml: appConfigYML,
              tab_open_during_save: 'yml',
            };

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/bitrise-yml');
            requestData = {
              bitrise_yml: appConfigYML,
            };

            break;
        }

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve(response.data);
            },
            function (response) {
              const error = new Error('Error saving CI config.');
              if (response && response.data && response.data.error) {
                error.message = response.data.error;
              }
              reject(errorFromResponse(response, error.message, 'Error saving CI config: '));
            },
          );
        });
      };

      requestService.getAppConfigYML = function (requestConfig) {
        return $q(function (resolve, reject) {
          RequestService.getAppConfigYML(requestConfig && requestConfig.timeout).then(resolve, reject);
        });
      };

      requestService.getPipelineConfig = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/pipeline_config`);

            break;
          case 'cli':
            return $q.reject(new Error('Getting pipeline config is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve({
                usesRepositoryYml: response.data.uses_repository_yml,
                lines: response.data.lines || 0,
                split: !!response.data.split,
                modularYamlSupported: !!response.data.modular_yaml_supported,
                lastModified: response.data.last_modified || null,
                ymlRootPath: response.data.yml_root_path || '',
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading pipeline config.', 'Error loading pipeline config: '));
            },
          );
        });
      };

      requestService.getSecretValue = function (secret, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(
              `/api/app/${requestService.appSlug}/secrets/${secret.key()}.json`,
            );

            break;
          case 'cli':
            return $q.reject(new Error('Getting secret environment value is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(response.data.value);
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error getting secret environment value.',
                  'Error getting secret environment value: ',
                ),
              );
            },
          );
        });
      };

      // Machine Type

      requestService.getMachineTypeConfigs = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/machine_type_configs`);

            break;
          case 'cli':
            return $q.reject(new Error('Getting machine types is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              const machineTypeConfigs = _.each(
                response.data.available_machine_type_configs,
                function (aStackSpecificMachineTypeConfigs, aStackType) {
                  const machineTypeSpecificConfig = {};
                  const stackSpecificMachineTypeConfigs = {};

                  stackSpecificMachineTypeConfigs[aStackType] = {
                    defaultMachineType: aStackSpecificMachineTypeConfigs.default_machine_type,
                    machineTypes: _.map(
                      aStackSpecificMachineTypeConfigs.machine_types,
                      function (aMachineTypeConfig, aMachineType) {
                        machineTypeSpecificConfig[aMachineType] = {
                          name: aMachineTypeConfig.name,
                          cpuCount: aMachineTypeConfig.cpu_count,
                          cpuDescription: aMachineTypeConfig.cpu_description,
                          ram: aMachineTypeConfig.ram,
                          creditPerMin: aMachineTypeConfig.credit_per_min,
                          isAvailable: aMachineTypeConfig.is_available,
                          note: aMachineTypeConfig.note,
                        };

                        return machineTypeSpecificConfig[aMachineType];
                      },
                    ),
                  };

                  return stackSpecificMachineTypeConfigs[aStackType];
                },
              );

              resolve({
                machineTypeConfigs,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error getting machine types.', 'Error getting machine types: '));
            },
          );
        });
      };

      // Stacks

      requestService.getStackAndDockerImage = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/stack`);

            break;
          case 'cli':
            return $q.reject(new Error('Getting stack is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve({
                stackID: response.data.stack_identifier,
                dockerImage: response.data.docker_image_name,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error getting stack.', 'Error getting stack: '));
            },
          );
        });
      };

      requestService.getStacks = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/all_stack_info`);

            break;
          case 'cli':
            return $q.reject(new Error('Getting stacks is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              const stackDatas = _.map(response.data.available_stacks, function (aStackData, stackID) {
                return {
                  id: stackID,
                  name: aStackData.title,
                  description: aStackData.description,
                  descriptionURL: aStackData['description-link'],
                  descriptionURLGen2: aStackData['description-link-gen2'],
                  descriptionURLGen2AppleSilicon: aStackData['description-link-gen2-applesilicon'],
                  preInstalledToolsLink: aStackData['pre-installed-tools-link'],
                  projectTypes: aStackData['project-types'],
                  queueInfo: aStackData.queueInfo,
                  rollbackVersions: aStackData.rollback_version,
                };
              });

              const projecTypeDatas = _.map(
                response.data.project_types_with_default_stacks,
                function (aProjectTypeData, projectTypeID) {
                  return {
                    id: projectTypeID,
                    defaultStackID: aProjectTypeData.default_stack,
                  };
                },
              );

              resolve({
                stackDatas,
                projectTypeDatas: projecTypeDatas,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error getting stacks.', 'Error getting stacks: '));
            },
          );
        });
      };

      requestService.getApp = function (appSlug, requestConfig) {
        const requestURL = requestService.webServerPath(`/app/${appSlug}.json`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, undefined, requestConfig).then(function (response) {
            resolve(response.data);
          });
        });
      };

      return requestService;
    });
})();

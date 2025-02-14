// eslint-disable-next-line import/no-extraneous-dependencies
import jsyaml from 'js-yaml';

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

      requestService.updateAppleCredentialUser = function (userSlug, requestConfig) {
        let requestURL;
        let requestData;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}.json`);

            requestData = {
              apple_credential_user_slug: userSlug,
            };

            break;
          case 'cli':
            return $q.reject(new Error('Saving Apple Credential User for app is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.put(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error saving Apple Credential User for app',
                  'Error saving Apple Credential User for app: ',
                ),
              );
            },
          );
        });
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

      // Secrets

      requestService.postSecrets = function (secrets, requestConfig) {
        let requestURL;
        let requestData;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/secrets-without-values`);
            requestData = {
              app_secrets: {
                envs: _.map(secrets, function (aSecret) {
                  return aSecret.userVariableConfig;
                }),
              },
            };

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/secrets');
            requestData = {
              envs: _.map(secrets, function (aSecret) {
                return aSecret.userVariableConfig;
              }),
            };

            break;
        }

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve(response.data);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error saving secrets.', 'Error saving secrets: '));
            },
          );
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

      requestService.getSecrets = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/secrets-without-values`);

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/secrets');

            break;
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(response.data.envs);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading secrets.', 'Error loading secrets: '));
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

      // Steps

      requestService.libraryFetch = function (libraryURLs, requestConfig) {
        let requestMethod;
        let requestURL;
        let requestData;

        if (libraryURLs) {
          requestData = {
            libraries: libraryURLs,
          };
        }

        switch (requestService.mode) {
          case 'website':
            requestMethod = 'get';
            requestURL = requestService.webServerPath(
              'https://bitrise-steplib-collection.s3.amazonaws.com/spec.json.gz',
            );

            break;
          case 'cli':
            requestMethod = 'post';
            requestURL = requestService.localServerPath('/api/steplib');

            break;
        }

        return $q(function (resolve, reject) {
          $http[requestMethod](requestURL, requestData, requestConfig).then(
            function (response) {
              switch (requestService.mode) {
                case 'website': {
                  const libraryMap = {};
                  libraryMap[response.data.steplib_source] = response.data;

                  resolve(libraryMap);

                  break;
                }
                case 'cli':
                  resolve(response.data.library_map);

                  break;
              }
            },
            function (response) {
              reject(errorFromResponse(response, 'Error fetching libraries.', 'Error fetching libraries: '));
            },
          );
        });
      };

      requestService.stepConfigFetch = function (step, requestConfig) {
        const requestURL = requestService.localServerPath('/api/step');
        const requestData = {};

        if (step.localPath) {
          requestData.library = 'path';
          requestData.id = step.localPath;
        } else if (step.gitURL) {
          switch (requestService.mode) {
            case 'website': {
              let stepYMLurl;

              const githubGitURLRegexp =
                /^(?:(?:http|https):\/\/){0,1}(?:www.){0,1}(?:(?:github).com\/)(.*?)(?:.git){0,1}$/;
              if (githubGitURLRegexp.test(step.gitURL)) {
                stepYMLurl = requestService.webServerPath(
                  `https://raw.githubusercontent.com/${githubGitURLRegexp.exec(step.gitURL)[1]}/${step.version ? step.version : 'master'}/step.yml`,
                );
              }

              if (stepYMLurl) {
                return $q(function (resolve, reject) {
                  $http.get(stepYMLurl, requestConfig).then(
                    function (response) {
                      try {
                        const defaultStepConfig = jsyaml.load(response.data);
                        resolve(defaultStepConfig);
                      } catch (error) {
                        reject(new Error(`Error fetching step config from ${stepYMLurl}`));
                      }
                    },
                    function (response) {
                      reject(
                        new Error(
                          `Error fetching step config from GitHub: ${response.data || `Status ${response.status}`}`,
                        ),
                      );
                    },
                  );
                });
              }
              return $q.reject(new Error(`Step config fetch not supported for host: ${stepYMLurl}`));
            }
            case 'cli': {
              let url = step.gitURL;
              const sshMatch = url.match(/^git@([^:]+):(.+)$/);

              if (sshMatch) {
                const [, host, path] = sshMatch;
                url = `https://${host}/${path}`;
              }

              url = url.replace('http://', 'https://');

              requestData.library = 'git';
              requestData.id = url;
              requestData.version = step.version;

              break;
            }
          }
        } else {
          requestData.library = step.libraryURL;
          requestData.id = step.id;
          requestData.version = step.version;
        }

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve(response.data.step);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error fetching step config.'));
            },
          );
        });
      };

      // Variables

      requestService.getDefaultOutputs = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/default-outputs`);

            break;
          case 'cli':
            requestURL = requestService.localServerPath('/api/default-outputs');

            break;
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(response.data);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading default outputs.', 'Error loading default outputs: '));
            },
          );
        });
      };

      // Machine Type

      requestService.getMachineTypeConfigs = function (requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/machine-type-configs`);

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
            requestURL = requestService.webServerPath(`/app/${requestService.appSlug}/stack`);

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

      // Provisioning profiles

      requestService.getDetailsOfProvProfile = function (databaseID, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/provisioning_profiles/${databaseID}`);

            break;
          case 'cli':
            return $q.reject(new Error('Getting details of provisioning profile is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve({
                uuid: response.data.prov_profile_details.uuid,
                expiresAt: dateService.dateFromString(response.data.prov_profile_details.expiration_date),
                exportType: response.data.prov_profile_details.export_type,
                teamName: response.data.prov_profile_details.team_name,
                teamID: response.data.prov_profile_details.team_id,
                bundleID: response.data.prov_profile_details.bundle_id,
                developerCertificateIdentities: _.map(
                  response.data.prov_profile_details.developer_certificates,
                  function (aCertificateIdentity) {
                    return {
                      commonName: aCertificateIdentity.common_name,
                      startDate: dateService.dateFromString(aCertificateIdentity.start_date),
                      endDate: dateService.dateFromString(aCertificateIdentity.end_date),
                      teamName: aCertificateIdentity.team_name,
                      teamID: aCertificateIdentity.team_id,
                      serial: aCertificateIdentity.serial,
                    };
                  },
                ),
                capabilityKeys: _.keys(response.data.prov_profile_details.entitlements),
                provisionedDevices: _.map(response.data.prov_profile_details.provisioned_devices, function (udid) {
                  return {
                    udid,
                  };
                }),
              });
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error getting details of provisioning profile.',
                  'Error getting details of provisioning profile: ',
                ),
              );
            },
          );
        });
      };

      requestService.postProvProfileCreate = function (fileName, fileSize, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/provisioning_profiles`);

        const requestData = {
          upload_file_name: fileName,
          upload_file_size: fileSize,
        };

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve({
                databaseID: response.data.id,
                uploadURL: response.data.upload_url,
              });
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error creating provisioning profile.',
                  'Error creating provisioning profile: ',
                ),
              );
            },
          );
        });
      };

      requestService.finalizeProvProfileUpload = function (databaseID, isSuccess, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/provisioning_profiles/${databaseID}/finalize`);

        const requestData = {
          success: isSuccess,
        };

        return $q(function (resolve, reject) {
          return $http.post(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error finalizing provisioning profile upload.',
                  'Error finalizing provisioning profile upload: ',
                ),
              );
            },
          );
        });
      };

      requestService.getProvProfiles = function (requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/provisioning_profiles`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(
                _.map(response.data.prov_profile_documents, function (aProvProfileData) {
                  return {
                    databaseID: aProvProfileData.id,
                    isProcessed: aProvProfileData.processed,
                    uploadFileName: aProvProfileData.upload_file_name,
                    isExpose: aProvProfileData.is_expose,
                    isProtected: aProvProfileData.is_protected,
                  };
                }),
              );
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error loading provisioning profiles.',
                  'Error loading provisioning profiles: ',
                ),
              );
            },
          );
        });
      };

      requestService.protectProvProfile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/provisioning_profiles/${databaseID}/protect`);

        return $q(function (resolve, reject) {
          $http.post(requestURL, undefined, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error protecting provisioning profile.',
                  'Error protecting provisioning profile: ',
                ),
              );
            },
          );
        });
      };

      requestService.downloadProvProfile = function (databaseID) {
        return requestService.webServerPath(`/api/provisioning_profiles/${databaseID}/download`);
      };

      requestService.deleteProvProfile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/provisioning_profiles/${databaseID}`);

        return $q(function (resolve, reject) {
          $http.delete(requestURL, requestConfig).then(
            function (response) {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error deleting provisioning profile.',
                  'Error deleting provisioning profile: ',
                ),
              );
            },
          );
        });
      };

      // Certificates

      requestService.getDetailsOfCertificate = function (certificateDatabaseID, certificatePassword, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(
              `/api/certificates/${certificateDatabaseID}?password=${certificatePassword}`,
            );

            break;
          case 'cli':
            return $q.reject(new Error('Getting details of certificate is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(
                _.map(response.data.build_certificate_details, function (aCertificateData) {
                  return {
                    commonName: aCertificateData.common_name,
                    startDate: dateService.dateFromString(aCertificateData.start_date),
                    endDate: dateService.dateFromString(aCertificateData.end_date),
                    teamName: aCertificateData.team_name,
                    teamID: aCertificateData.team_id,
                    serial: aCertificateData.serial,
                  };
                }),
              );
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error getting details of certificate.',
                  'Error getting details of certificate: ',
                ),
              );
            },
          );
        });
      };

      requestService.postCertificateCreate = function (fileName, fileSize, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/certificates`);

        const requestData = {
          upload_file_name: fileName,
          upload_file_size: fileSize,
        };

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve({
                databaseID: response.data.id,
                uploadURL: response.data.upload_url,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error creating certificate.', 'Error creating certificate: '));
            },
          );
        });
      };

      requestService.finalizeCertificateUpload = function (databaseID, isSuccess, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/certificates/${databaseID}/finalize`);

        const requestData = {
          success: isSuccess,
        };

        return $q(function (resolve, reject) {
          return $http.post(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error finalizing certificate upload.',
                  'Error finalizing certificate upload: ',
                ),
              );
            },
          );
        });
      };

      requestService.getCertificates = function (requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/certificates`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              resolve(
                _.map(response.data.build_certificates, function (aCertificateData) {
                  return {
                    databaseID: aCertificateData.id,
                    isProcessed: aCertificateData.processed,
                    uploadFileName: aCertificateData.upload_file_name,
                    password: aCertificateData.certificate_password,
                    isExpose: aCertificateData.is_expose,
                    isProtected: aCertificateData.is_protected,
                  };
                }),
              );
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading certificates.', 'Error loading certificates: '));
            },
          );
        });
      };

      requestService.protectCertificate = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/certificates/${databaseID}/protect`);

        return $q(function (resolve, reject) {
          $http.post(requestURL, undefined, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(errorFromResponse(response, 'Error protecting certificate.', 'Error protecting certificate: '));
            },
          );
        });
      };

      requestService.downloadCertificate = function (databaseID) {
        return requestService.webServerPath(`/api/certificates/${databaseID}/download`);
      };

      requestService.putCertificatePasswordSave = function (databaseID, password, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/certificates/${databaseID}/password`);

        const requestData = {
          certificate_password: password,
        };

        return $q(function (resolve, reject) {
          return $http.put(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error saving certificate password.',
                  'Error saving certificate password: ',
                ),
              );
            },
          );
        });
      };

      requestService.deleteCertificate = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/certificates/${databaseID}`);

        return $q(function (resolve, reject) {
          $http.delete(requestURL, requestConfig).then(
            function (response) {
              resolve();
            },
            function (response) {
              reject(errorFromResponse(response, 'Error deleting certificate.', 'Error deleting certificate: '));
            },
          );
        });
      };

      // Generic files

      requestService.postGenericFileCreate = function (envVarPartialID, fileName, fileSize, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/generic_files`);

        const requestData = {
          user_env_key: envVarPartialID,
          upload_file_name: fileName,
          upload_file_size: fileSize,
        };

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve({
                databaseID: response.data.id,
                uploadURL: response.data.upload_url,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error creating generic file.', 'Error creating generic file: '));
            },
          );
        });
      };

      requestService.finalizeGenericFileUpload = function (databaseID, isSuccess, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}/finalize`);

        const requestData = {
          success: isSuccess,
        };

        return $q(function (resolve, reject) {
          return $http.post(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error finalizing generic file upload.',
                  'Error finalizing generic file upload: ',
                ),
              );
            },
          );
        });
      };

      requestService.getGenericFiles = function (requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/generic_files`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              const KeystoreFile = $injector.get('KeystoreFile');

              resolve(
                _.map(
                  _.filter(response.data.project_file_storage_documents, function (aGenericFileData) {
                    return aGenericFileData.user_env_key !== KeystoreFile.downloadURLEnvVarPartialID;
                  }),
                  function (aGenericFileData) {
                    return {
                      databaseID: aGenericFileData.id,
                      isProcessed: aGenericFileData.processed,
                      envVarPartialID: aGenericFileData.user_env_key,
                      uploadFileName: aGenericFileData.upload_file_name,
                      isExpose: aGenericFileData.is_expose,
                      isProtected: aGenericFileData.is_protected,
                    };
                  },
                ),
              );
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading generic files.', 'Error loading generic files: '));
            },
          );
        });
      };

      requestService.protectGenericFile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}/protect`);

        return $q(function (resolve, reject) {
          $http.post(requestURL, undefined, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(errorFromResponse(response, 'Error protecting generic file.', 'Error protecting generic file: '));
            },
          );
        });
      };

      requestService.downloadGenericFile = function (databaseID) {
        return requestService.webServerPath(`/api/generic_files/${databaseID}/download`);
      };

      requestService.deleteGenericFile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}`);

        return $q(function (resolve, reject) {
          $http.delete(requestURL, requestConfig).then(
            function (response) {
              resolve();
            },
            function (response) {
              reject(errorFromResponse(response, 'Error deleting generic file.', 'Error deleting generic file: '));
            },
          );
        });
      };

      // Android Keystore file

      requestService.postKeystoreFileCreate = function (fileName, fileSize, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/generic_files`);

        const KeystoreFile = $injector.get('KeystoreFile');

        const requestData = {
          user_env_key: KeystoreFile.downloadURLEnvVarPartialID,
          upload_file_name: fileName,
          upload_file_size: fileSize,
        };

        return $q(function (resolve, reject) {
          $http.post(requestURL, requestData, requestConfig).then(
            function (response) {
              resolve({
                databaseID: response.data.id,
                uploadURL: response.data.upload_url,
              });
            },
            function (response) {
              reject(errorFromResponse(response, 'Error creating keystore file.', 'Error creating keystore file: '));
            },
          );
        });
      };

      requestService.finalizeKeystoreFileUpload = function (databaseID, isSuccess, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}/finalize`);

        const requestData = {
          success: isSuccess,
        };

        return $q(function (resolve, reject) {
          return $http.post(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error finalizing keystore file upload.',
                  'Error finalizing keystore file upload: ',
                ),
              );
            },
          );
        });
      };

      requestService.getKeystoreFile = function (requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/generic_files`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, requestConfig).then(
            function (response) {
              const KeystoreFile = $injector.get('KeystoreFile');

              const keystoreFileData = _.filter(response.data.project_file_storage_documents, function (item) {
                return item.user_env_key.startsWith(KeystoreFile.downloadURLEnvVarPartialID);
              });

              const responseData = keystoreFileData.map(function (item) {
                let itemData = null;
                itemData = {
                  databaseID: item.id,
                  isProcessed: item.processed,
                  envVarPartialID: item.user_env_key,
                  uploadFileName: item.upload_file_name,
                  isExpose: item.is_expose,
                  isProtected: item.is_protected,
                };

                if (item.exposed_meta_datastore) {
                  itemData.password = item.exposed_meta_datastore.PASSWORD;
                  itemData.alias = item.exposed_meta_datastore.ALIAS;
                  itemData.privateKeyPassword = item.exposed_meta_datastore.PRIVATE_KEY_PASSWORD;
                }

                return itemData;
              });

              resolve(responseData);
            },
            function (response) {
              reject(errorFromResponse(response, 'Error loading keystore file.', 'Error loading keystore file: '));
            },
          );
        });
      };

      requestService.downloadKeystoreFile = function (databaseID) {
        return requestService.webServerPath(`/api/generic_files/${databaseID}/download`);
      };

      requestService.putKeystoreFileMetadataSave = function (
        databaseID,
        password,
        alias,
        privateKeyPassword,
        requestConfig,
      ) {
        const requestURL = requestService.webServerPath(`/api/keystore_files/${databaseID}/metadata`);

        const requestData = {
          exposed_meta: {
            PASSWORD: password,
            ALIAS: alias,
            PRIVATE_KEY_PASSWORD: privateKeyPassword,
          },
        };

        return $q(function (resolve, reject) {
          return $http.put(requestURL, requestData, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(
                  response,
                  'Error saving keystore file metadata.',
                  'Error saving keystore file metadata: ',
                ),
              );
            },
          );
        });
      };

      requestService.protectKeystoreFile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}/protect`);

        return $q(function (resolve, reject) {
          $http.post(requestURL, undefined, requestConfig).then(
            function () {
              resolve();
            },
            function (response) {
              reject(
                errorFromResponse(response, 'Error protecting keystore file.', 'Error protecting keystore file: '),
              );
            },
          );
        });
      };

      requestService.deleteKeystoreFile = function (databaseID, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/generic_files/${databaseID}`);

        return $q(function (resolve, reject) {
          $http.delete(requestURL, requestConfig).then(
            function (response) {
              resolve();
            },
            function (response) {
              reject(errorFromResponse(response, 'Error deleting keystore file.', 'Error deleting keystore file: '));
            },
          );
        });
      };

      // Amazon S3

      requestService.uploadFileToStorage = function (uploadURL, file) {
        return $q(function (resolve, reject) {
          $.ajax({
            type: 'PUT',
            url: uploadURL,
            contentType: 'binary/octet-stream',
            processData: false,
            data: file,
          }).then(
            function () {
              resolve();
            },
            function (response) {
              reject(new Error('Error uploading file to storage.'));
            },
          );
        });
      };

      requestService.getApp = function (appSlug, requestConfig) {
        const requestURL = requestService.webServerPath(`/api/app/${appSlug}`);

        return $q(function (resolve, reject) {
          $http.get(requestURL, undefined, requestConfig).then(function (response) {
            resolve(response.data);
          });
        });
      };

      requestService.startBuild = function ({ branch, workflow, triggerToken, triggeredBy }, requestConfig) {
        let requestURL;

        switch (requestService.mode) {
          case 'website':
            requestURL = requestService.webServerPath(`/api/app/${requestService.appSlug}/builds`);

            break;
          case 'cli':
            return $q.reject(new Error('Starting build is only available in website mode'));
        }

        return $q(function (resolve, reject) {
          $http
            .post(
              requestURL,
              {
                payload: {
                  hook_info: { type: 'bitrise', build_trigger_token: triggerToken },
                  build_params: { branch, workflow_id: workflow },
                  triggered_by: `WFE - @${triggeredBy || 'user'}`,
                },
              },
              requestConfig,
            )
            .then(
              function (response) {
                resolve(response.data);
              },
              function (response) {
                reject(errorFromResponse(response, 'Error starting build.', 'Error starting build: '));
              },
            );
        });
      };

      return requestService;
    });
})();

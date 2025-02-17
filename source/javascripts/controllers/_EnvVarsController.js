(function () {
  angular
    .module('BitriseWorkflowEditor')
    .controller(
      'EnvVarsController',
      function (
        $scope,
        $rootScope,
        $q,
        $cookies,
        requestService,
        stringService,
        appService,
        Progress,
        Variable,
        Popup,
      ) {
        const viewModel = this;

        $scope.appService = appService;
        $scope.Variable = Variable;
        $scope.requestService = requestService;

        let mode;
        let envVarsWatchers;

        viewModel.envVarsBySource = undefined;

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::discardChanges', function () {
            configure();
          }),
        );

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::saveSuccess', function () {
            configure();
          }),
        );

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::saveError', function () {
            configure();
          }),
        );

        viewModel.configureWithMode = function (_mode) {
          mode = _mode;

          configure();
        };

        function configure() {
          switch (mode) {
            case 'secrets':
              configureWithSecrets();

              break;
            case 'env-vars':
              configureWithAppConfig();

              break;
          }

          _.each(viewModel.envVarsBySource, function (envVarsOfSource) {
            _.each(envVarsOfSource.envVars, function (anEnvVar) {
              anEnvVar.customProperties.progress = new Progress();
              anEnvVar.customProperties.isMenuVisible = false;
            });
          });

          configureEnvVarsWatchers();
        }

        function configureWithSecrets() {
          viewModel.envVarsBySource = [
            {
              type: 'secrets',
              shouldShowInfoBox: $cookies.get('should_show_secrets_info_box') === 'true',
              toggleInfoBoxVisibility() {
                this.shouldShowInfoBox = !this.shouldShowInfoBox;
                $cookies.put('should_show_secrets_info_box', this.shouldShowInfoBox ? 'true' : 'false', {
                  expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                });
              },
              envVars: appService.secrets,
            },
          ];
        }

        function configureWithAppConfig() {
          viewModel.envVarsBySource = [];

          viewModel.envVarsBySource.push({
            type: 'app',
            notification:
              'Project Environment Variables will also be available in builds triggered by pull requests. You should NOT add any private information here.',
            envVars: _.map(
              appService.appConfig.app && appService.appConfig.app.envs ? appService.appConfig.app.envs : [],
              function (anAppEnvVarConfig) {
                return new Variable(anAppEnvVarConfig, Variable.defaultVariableConfig());
              },
            ),
          });

          _.each(appService.appConfig.workflows, function (aWorkflowConfig, aWorkflowID) {
            viewModel.envVarsBySource.push({
              type: 'workflow',
              workflowID: aWorkflowID,
              notification: `You can specify Env Vars which will only be available for the steps in your ${
                aWorkflowID
              } Workflow.`,
              envVars: _.map(aWorkflowConfig.envs, function (anEnvVarConfig) {
                return new Variable(anEnvVarConfig, Variable.defaultVariableConfig());
              }),
            });
          });
        }

        function configureEnvVarsWatchers() {
          if (envVarsWatchers) {
            _.each(envVarsWatchers, function (anEnvVarsWatcher) {
              anEnvVarsWatcher();
            });
          }

          envVarsWatchers = _.map(viewModel.envVarsBySource, function (envVarsOfSource) {
            return $scope.$watch(
              function () {
                return envVarsOfSource;
              },
              function (newEnvVarsOfSource) {
                switch (newEnvVarsOfSource.type) {
                  case 'app':
                    if (!appService.appConfig) {
                      return;
                    }

                    if (!appService.appConfig.app) {
                      appService.appConfig.app = {};
                    }

                    appService.appConfig.app.envs = _.map(newEnvVarsOfSource.envVars, function (anEnvVar) {
                      return anEnvVar.userVariableConfig;
                    });

                    if (_.isEmpty(appService.appConfig.app.envs)) {
                      delete appService.appConfig.app.envs;
                    }

                    if (_.isEmpty(appService.appConfig.app)) {
                      delete appService.appConfig.app;
                    }

                    break;
                  case 'workflow': {
                    if (!appService.appConfig) {
                      return;
                    }

                    appService.appConfig.workflows[newEnvVarsOfSource.workflowID].envs = _.map(
                      newEnvVarsOfSource.envVars,
                      function (anEnvVar) {
                        return anEnvVar.userVariableConfig;
                      },
                    );

                    if (_.isEmpty(appService.appConfig.workflows[newEnvVarsOfSource.workflowID].envs)) {
                      delete appService.appConfig.workflows[newEnvVarsOfSource.workflowID].envs;
                    }

                    break;
                  }
                }
              },
              true,
            );
          });
        }

        viewModel.addToEnvVars = function (envVars) {
          const newEnvVar = new Variable(
            {
              '': '',
            },
            Variable.defaultVariableConfig(),
          );
          newEnvVar.isExpand(false);

          newEnvVar.customProperties.progress = new Progress();
          newEnvVar.customProperties.isMenuVisible = false;

          envVars.push(newEnvVar);
        };

        viewModel.removeEnvVarFromEnvVars = function (envVar, envVars) {
          const index = _.indexOf(envVars, envVar);

          envVars.splice(index, 1);
        };

        viewModel.envVarValidationWarning = function (envVar, keyUniquenessScope) {
          const errors = [];

          if (!Variable.isValidKey(envVar.key(), keyUniquenessScope)) {
            errors.push(
              new Error(
                'invalid Environment Variable key. Should not be empty, should only contain uppercase, lowercase letters, numbers, underscores, should not begin with a number',
              ),
            );

            if (keyUniquenessScope) {
              errors.push(new Error('should be unique'));
            }
          }

          return errors.length > 0 ? stringService.errorMessageFromErrors(errors) : null;
        };

        viewModel.valueVisibilityGetterSetterForEnvVar = function (secret) {
          return function (shouldShowValue) {
            if (shouldShowValue !== undefined) {
              if (shouldShowValue && !secret.customProperties.progress.isInProgress) {
                getSecretValue(secret);
              }

              secret.shouldShowValue = shouldShowValue;
            }

            return secret.shouldShowValue;
          };
        };

        function getSecretValue(secret) {
          secret.customProperties.progress.start('Loading, wait a sec...');

          appService.getSecretValue(secret).then(
            function () {
              secret.customProperties.progress.success();
            },
            function (error) {
              secret.customProperties.progress.error(error);
            },
          );
        }

        viewModel.valueGetterSetterForEnvVar = function (envVar) {
          return function (value) {
            return envVar.value() !== null && envVar.shouldShowValue ? envVar.value(value) : '******';
          };
        };

        viewModel.makeEnvVarProtected = function (envVar) {
          Popup.showConfirmPopup(
            "'Protected' will be irreversible after save",
            'If you choose to make this variable protected no one will be able to reveal the value, you can overwrite the value only by deleting the current one and creating a new one.',
            'Make it protected',
            'Cancel',
          ).then(function () {
            envVar.shouldShowValue = false;
            envVar.isKeyChangeable = false;
            envVar.isProtected(true);
          });
        };
      },
    );
})();

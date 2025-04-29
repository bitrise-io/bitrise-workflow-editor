import _ from 'underscore';

import { configMergeDialog } from '@/components/ConfigMergeDialog/ConfigMergeDialog.store';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import PageProps from '@/core/utils/PageProps';
import GlobalProps from '@/core/utils/GlobalProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { safeDigest } from '@/services/react-compat';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import datadogRumCustomTiming from '../utils/datadogCustomRumTiming';

(function () {
  angular
    .module('BitriseWorkflowEditor')
    .controller(
      'MainController',
      function (
        $q,
        $scope,
        $rootScope,
        $timeout,
        $location,
        logger,
        appService,
        requestService,
        Popup,
        Progress,
        Stack,
        Variable,
        MachineType,
      ) {
        const viewModel = this;

        const originalOnbeforeunloadHandler = window.onbeforeunload;

        $scope.appService = appService;
        $scope.requestService = requestService;

        viewModel.isUpdateConfigurationDialogOpen = false;
        viewModel.appConfigYML = undefined;
        viewModel.defaultBranch = '';
        viewModel.gitRepoSlug = '';
        viewModel.appDetails = undefined;
        viewModel.menus = _.compact([
          {
            id: 'workflows',
            title: 'Workflows',
            path: 'workflows',
            possibleURLParameterKeys: ['pipeline', 'workflow_id', 'tab'],
            cssClass: 'workflows',
          },
          {
            id: 'pipelines',
            title: 'Pipelines',
            path: 'pipelines',
            possibleURLParameterKeys: ['pipeline', 'workflow_id'],
            cssClass: 'pipelines',
          },
          {
            id: 'step_bundles',
            title: 'Step bundles',
            path: 'step_bundles',
            possibleURLParameterKeys: ['pipeline', 'workflow_id', 'tab'],
            cssClass: 'step_bundles',
          },
          {
            id: 'secrets',
            title: 'Secrets',
            path: 'secrets',
            possibleURLParameterKeys: ['pipeline', 'workflow_id'],
            cssClass: 'secrets',
          },
          {
            id: 'env-vars',
            title: 'Env Vars',
            path: 'env_vars',
            possibleURLParameterKeys: ['pipeline', 'workflow_id'],
            cssClass: 'env-vars',
          },
          {
            id: 'triggers',
            title: 'Triggers',
            path: 'triggers',
            possibleURLParameterKeys: ['trigger_type', 'pipeline', 'workflow_id'],
            cssClass: 'triggers',
          },
          RuntimeUtils.isWebsiteMode()
            ? {
                id: 'stack',
                title: 'Stack',
                path: 'stack',
                possibleURLParameterKeys: ['pipeline', 'workflow_id'],
                cssClass: 'stack',
              }
            : null,
          RuntimeUtils.isWebsiteMode()
            ? {
                id: 'licenses',
                title: 'Licenses',
                path: 'licenses',
                possibleURLParameterKeys: ['pipeline', 'workflow_id'],
                cssClass: 'hidden',
              }
            : null,
          {
            id: 'yml',
            title: 'Configuration YAML',
            path: 'yml',
            possibleURLParameterKeys: ['pipeline', 'workflow_id'],
            cssClass: 'yml',
            divided: true,
          },
        ]);
        viewModel.menuProgress = new Progress();
        viewModel.currentMenu = undefined;
        viewModel.tourIds = ['menu-nav', 'workflow-main-toolbar', 'steps-container'];

        viewModel.loadDataProgress = new Progress();
        viewModel.saveProgress = new Progress();
        viewModel.changeMenuProgress = new Progress();
        viewModel.initAppProgress = new Progress();

        viewModel.shouldAllowYMLMenuWithoutDiscard = false;
        viewModel.lastWorkflowEditedDate = undefined;

        viewModel.isDiffDialogOpen = false;
        viewModel.originalYaml = '';
        viewModel.modifiedYaml = '';

        viewModel.openDiffDialog = function () {
          if (viewModel.currentMenu.id === 'yml') {
            viewModel.originalYaml = appService.savedAppConfigYML;
            viewModel.modifiedYaml = appService.appConfigYML;
          } else {
            viewModel.originalYaml = BitriseYmlApi.toYml(appService.savedAppConfig);
            viewModel.modifiedYaml = BitriseYmlApi.toYml(appService.appConfig);
          }
          viewModel.isDiffDialogOpen = true;
          segmentTrack('Workflow Editor Diff Button Clicked', {
            tab_name: viewModel.currentMenu.id,
          });
          safeDigest($rootScope);
        };

        viewModel.closeDiffDialog = function () {
          viewModel.isDiffDialogOpen = false;
          viewModel.originalYaml = '';
          viewModel.modifiedYaml = '';
          safeDigest($rootScope);
        };

        viewModel.saveDiffChanges = function (changedYaml) {
          try {
            if (viewModel.currentMenu.id === 'yml') {
              appService.appConfigYML = changedYaml;
            } else {
              const changedAppConfig = BitriseYmlApi.fromYml(changedYaml);
              appService.appConfig = changedAppConfig;
            }
            safeDigest($rootScope);
          } catch (e) {
            segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
              tab_name: viewModel.currentMenu.id,
              source: 'diff',
            });
            Popup.showErrorPopup('Invalid YAML change', e.message);
          }
        };

        viewModel.closeConfigMergeDialog = function (method) {
          viewModel.saveProgress.reset();
          viewModel.deferredConflictResolution.reject();

          configMergeDialog.setState(configMergeDialog.getInitialState());

          segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
            tab_name: viewModel.currentMenu.id,
            popup_step_dismiss_method: method,
          });
        };

        viewModel.saveConfigMergeDialogResult = function () {
          viewModel.deferredConflictResolution.resolve({
            finalYaml: configMergeDialog.getState().finalYaml,
            shouldReCheckRemoteChanges: true,
          });

          configMergeDialog.setState({
            isLoading: true,
            errorMessage: '',
          });

          segmentTrack('Workflow Editor Config Merge Popup Save Results Button Clicked', {
            tab_name: viewModel.currentMenu.id,
          });
        };

        $scope.$on('$locationChangeSuccess', function (__, newUrl, oldUrl) {
          if (window !== window.parent) {
            const oldHash = new URL(oldUrl).hash;
            const newHash = new URL(newUrl).hash;

            if (oldHash !== newHash) {
              window.parent.location.hash = newHash;
            }
          }

          $timeout(function () {
            viewModel.changeMenuProgress.success();
          }, 0);
        });

        function selectInitialMenu() {
          let initialMenu = _.find(viewModel.menus, function (aMenu) {
            return `/${aMenu.path}` === $location.path();
          });
          if (!initialMenu || !viewModel.isMenuEnabled(initialMenu)) {
            initialMenu = _.find(viewModel.menus, function (menu) {
              return viewModel.isMenuEnabled(menu);
            });
          }

          viewModel.menuSelected(initialMenu);
        }

        function load() {
          viewModel.loadDataProgress.start('Loading, wait a sec...');

          $q(function (resolve, reject) {
            switch (viewModel.currentMenu.id) {
              case 'pipelines': {
                const loadPromises = [appService.getAppConfig()];

                if (RuntimeUtils.isWebsiteMode()) {
                  loadPromises.push(appService.getPipelineConfig());
                }

                $q.all(loadPromises).then(() => {
                  if (RuntimeUtils.isWebsiteMode()) {
                    return Stack.getAll().then(appService.getStackAndDockerImage).then(resolve, reject);
                  }

                  return resolve();
                }, reject);

                break;
              }
              case 'workflows':
              case 'step_bundles':
              case 'triggers':
              case 'licenses': {
                const loadPromises = [appService.getAppConfig()];
                if (RuntimeUtils.isWebsiteMode()) {
                  loadPromises.push(appService.getPipelineConfig());
                }

                $q.all(loadPromises).then(resolve, reject);

                break;
              }
              case 'env-vars': {
                const loadPromises = [appService.getAppConfig()];
                if (RuntimeUtils.isWebsiteMode()) {
                  loadPromises.push(Stack.getAll());
                  loadPromises.push(appService.getPipelineConfig());
                }
                let loadPromise = $q.all(loadPromises);
                if (RuntimeUtils.isWebsiteMode()) {
                  loadPromise = loadPromise.then(appService.getStackAndDockerImage).then(() => {
                    if (appService.appDetails.isMachineTypeSelectorAvailable) {
                      return MachineType.getAll().then(appService.getDefaultMachineType);
                    }
                  });
                }

                loadPromise.then(
                  function () {
                    resolve();
                  },
                  function (error) {
                    reject(error);
                  },
                );
                break;
              }
              case 'secrets':
                resolve();
                break;
              case 'stack':
                appService.getAppConfigYML();
                $q.all([appService.getAppConfig(), appService.getPipelineConfig(), Stack.getAll()])
                  .then(appService.getStackAndDockerImage)
                  .then(function () {
                    if (appService.appDetails.isMachineTypeSelectorAvailable) {
                      return MachineType.getAll().then(appService.getDefaultMachineType);
                    }
                  })
                  .then(resolve, reject);

                break;
              case 'yml':
                appService.getAppConfigYML().then(
                  function () {
                    resolve();
                  },
                  function (response) {
                    if (response.bitriseYml) {
                      reject(response.error);
                    } else {
                      reject(response);
                    }
                  },
                );

                break;
            }
          }).then(
            function () {
              viewModel.loadDataProgress.success();
            },
            function (error) {
              viewModel.loadDataProgress.error(error);

              viewModel.shouldAllowYMLMenuWithoutDiscard = true;
            },
          );
        }

        viewModel.menuSelected = function (menu, params) {
          if (menu === viewModel.currentMenu) {
            return;
          }

          window.DD_RUM?.startView(`/app/?/workflow_editor#!/${menu.id}`);
          viewModel.menuProgress.start('Loading, wait a sec...');

          let shouldCallLoadAfterMenuChange = true;

          $q(function (resolve, reject) {
            if (!viewModel.currentMenu) {
              resolve();

              return;
            }

            const menuIDsByHandledSource = [
              ['workflows', 'pipelines', 'step_bundles', 'env-vars', 'triggers'],
              ['secrets'],
              ['stack'],
              ['licenses'],
              ['yml'],
            ];

            if (
              _.find(menuIDsByHandledSource, function (menuIDsOfSource) {
                return _.contains(menuIDsOfSource, viewModel.currentMenu.id);
              }) ===
              _.find(menuIDsByHandledSource, function (menuIDsOfSource) {
                return _.contains(menuIDsOfSource, menu.id);
              })
            ) {
              shouldCallLoadAfterMenuChange = false;

              resolve();

              return;
            }

            if (!viewModel.hasUnsavedChanges()) {
              resolve();

              return;
            }

            if (viewModel.shouldAllowYMLMenuWithoutDiscard) {
              viewModel.shouldAllowYMLMenuWithoutDiscard = false;

              resolve();

              return;
            }

            segmentTrack('Workflow Editor Unsaved Changes Popup Shown', {
              tab_name: viewModel.currentMenu.id,
            });

            Popup.showConfirmPopup(
              'Unsaved changes',
              'You need to save your unsaved changes before leaving this tab.',
              'Save',
              'Cancel',
              function () {
                viewModel
                  .save({
                    shouldReturnPromise: true,
                    source: 'unsaved_changes_save_button',
                  })
                  .then(
                    function () {
                      resolve();
                    },
                    function (error) {
                      reject();
                    },
                  );
              },
              function () {
                reject();
              },
            );
          }).then(
            function () {
              logger.setTags({ menuID: menu.id });

              _.each(_.without(viewModel.menus, menu), function (aMenu) {
                _.each(aMenu.possibleURLParameterKeys, function (aMenuURLParameterKey) {
                  if (!_.contains(menu.possibleURLParameterKeys, aMenuURLParameterKey)) {
                    $location.search(aMenuURLParameterKey, null).replace();
                  }
                });
              });

              const isInitialSelection = !viewModel.currentMenu;
              if (isInitialSelection && RuntimeUtils.isWebsiteMode()) {
                history.pushState(
                  {
                    eventID: 'backButtonPressedOnInitialWorkflowEditorPage',
                  },
                  '',
                );
              }

              viewModel.currentMenu = menu;
              if ($location.path() !== `/${menu.path}`) {
                if (params) {
                  $location.path(`/${menu.path}`).search(params).replace();
                } else {
                  $location.path(`/${menu.path}`).replace();
                }
              }

              const isNewPipelinesPage = menu.id === 'pipelines';
              const isNewWorkflowsPage = menu.id === 'workflows';

              if (!isInitialSelection && !isNewPipelinesPage && !isNewWorkflowsPage) {
                viewModel.changeMenuProgress.start('Loading tab, wait a sec...');
              }

              if (shouldCallLoadAfterMenuChange) {
                load();
              }

              viewModel.menuProgress.success();

              segmentTrack('Workflow Editor Tab Displayed', {
                tab_name: menu.id,
                is_default_tab: isInitialSelection,
                yml_source: appService?.pipelineConfig?.usesRepositoryYml ? 'git' : 'bitrise',
              });

              datadogRumCustomTiming('wfe', 'topNavigation');

              if (window.clarity) {
                if (GlobalProps?.userSlug()) {
                  window.clarity('identify', GlobalProps.userSlug(), undefined, `WFE - ${menu.title}`);
                }
                if (GlobalProps?.workspaceSlug()) {
                  window.clarity('set', 'workspace_slug', GlobalProps.workspaceSlug());
                }
              }
            },
            function () {
              viewModel.menuProgress.reset();
            },
          );
        };

        $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
          viewModel.menuProgress.error(new Error('Failed to load menu.'));
          logger.error(rejection);
        });

        viewModel.hasUnsavedChanges = function () {
          if (!viewModel.currentMenu) {
            return undefined;
          }

          let result = false;

          switch (viewModel.currentMenu.id) {
            case 'workflows':
            case 'env-vars':
            case 'pipelines':
            case 'step_bundles':
            case 'triggers':
              result = appService.appConfigHasUnsavedChanges();
              break;
            case 'secrets':
              result = false;
              break;
            case 'stack':
              result =
                appService.appConfigHasUnsavedChanges() ||
                appService.stackHasUnsavedChanges() ||
                appService.defaultMachineTypeHasUnsavedChanges() ||
                appService.rollbackVersionHasUnsavedChanges();
              break;
            case 'licenses':
              result = appService.appConfigHasUnsavedChanges();
              break;
            case 'yml':
              result = appService.appConfigYMLHasUnsavedChanges();
              break;
          }

          window.dispatchEvent(
            new CustomEvent('main::yml::has-unsaved-changes', {
              detail: result,
            }),
          );
          return result;
        };

        window.onload = function () {
          if (RuntimeUtils.isLocalMode()) {
            requestService.cancelAPIConnectionClose();
          }
        };

        window.onbeforeunload = function (event) {
          const isProd = process.env.NODE_ENV === 'prod';

          if (isProd && viewModel.hasUnsavedChanges()) {
            return 'You have unsaved changes. Press OK to confirm, or Cancel to stay on the current page.';
          }

          if (originalOnbeforeunloadHandler) {
            originalOnbeforeunloadHandler(event);
          }
        };

        window.onpopstate = function (event) {
          if (event.state && event.state.eventID === 'backButtonPressedOnInitialWorkflowEditorPage') {
            window.location.replace();
          }
        };

        viewModel.closeUpdateConfigurationDialog = function () {
          viewModel.isUpdateConfigurationDialogOpen = false;
          viewModel.deferredUserSavedYmlToRepository.reject();
        };

        viewModel.onSaveToRepoComplete = function () {
          viewModel.isUpdateConfigurationDialogOpen = false;
          viewModel.deferredUserSavedYmlToRepository.resolve();
        };

        function updateLastWorkflowMetadata() {
          const dateToday = new Date().toString();
          const appSlug = appService.appDetails?.slug;

          if (!appSlug) {
            return;
          }

          return requestService
            .updateCurrentUserMetadata({
              last_workflow_edited_date: dateToday,
              last_workflow_edited_app: appSlug,
            })
            .then(function () {
              viewModel.lastWorkflowEditedDate = dateToday;
            });
        }

        viewModel.getDataToSave = function () {
          return viewModel.dataToSave;
        };

        viewModel.save = function ({ shouldReturnPromise = false, source = 'save_changes_button' }) {
          let remoteConfig;
          let remoteVersion;

          const isYmlFormat = viewModel.currentMenu.id === 'yml';
          const shouldValidate = !['secrets', 'yml'].includes(viewModel.currentMenu.id);
          const isRepositorySavedYml = RuntimeUtils.isWebsiteMode() && appService.pipelineConfig.usesRepositoryYml;

          async function startSavingProcess() {
            viewModel.saveProgress.start('Saving, wait a sec...');
            segmentTrack('Workflow Editor Save Button Clicked', {
              source,
              tab_name: viewModel.currentMenu.id,
            });

            if (shouldValidate) {
              try {
                await appService.validateAppConfig();
              } catch (error) {
                return showErrorPopup(error);
              }
            }

            if (isRepositorySavedYml) {
              try {
                const method = await showSaveRepositoryYmlDialog();
                return await endSavingProcess(method);
              } catch (error) {
                return showErrorPopup(error);
              }
            }

            try {
              const method = await saveWithConflictResolution();
              await endSavingProcess(method);
            } catch (error) {
              return showErrorPopup(error);
            }
          }

          async function showErrorPopup(error) {
            viewModel.saveProgress.reset();
            $rootScope.$emit('MainController::saveError');
            Popup.showErrorPopup('Failed to save changes.', error.message);
            segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
              source: 'save',
              tab_name: viewModel.currentMenu.id,
            });
            safeDigest($scope);
          }

          /**
           * @returns {Promise<'cancel' | 'save' | 'force-reload'>}
           */
          async function showSaveRepositoryYmlDialog() {
            viewModel.isUpdateConfigurationDialogOpen = true;
            viewModel.deferredUserSavedYmlToRepository = $q.defer();
            viewModel.dataToSave = isYmlFormat ? appService.appConfigYML : appService.appConfig;

            safeDigest($scope);

            try {
              await viewModel.deferredUserSavedYmlToRepository.promise;
              return 'force-reload';
            } catch {
              return 'cancel';
            }
          }

          /**
           * @param {'cancel' | 'save' | 'force-reload'} mode
           */
          async function saveWithConflictResolution(finalYaml = '', mode = 'save') {
            const saveActions = {
              yml: () => {
                const data = finalYaml || appService.appConfigYML;
                return appService.saveAppConfigYML(viewModel.currentMenu.id, data, remoteVersion);
              },
              stack: () => {
                const data = finalYaml ? BitriseYmlApi.fromYml(finalYaml) : appService.appConfig;
                const enableWfeReactStacksPage = useFeatureFlag('enable-wfe-react-stacks-and-machines-page');
                if (enableWfeReactStacksPage) {
                  return appService.saveAppConfig(viewModel.currentMenu.id, data, remoteVersion);
                }
                return appService.saveStackAndDockerImage(viewModel.currentMenu.id, data, remoteVersion);
              },
              secrets: () => {
                return Promise.resolve();
              },
              default: () => {
                const data = finalYaml ? BitriseYmlApi.fromYml(finalYaml) : appService.appConfig;
                return appService.saveAppConfig(viewModel.currentMenu.id, data, remoteVersion);
              },
            };

            try {
              await (saveActions[viewModel.currentMenu.id] || saveActions.default)();
              return mode;
            } catch (error) {
              const hasConflict = error?.status === 409;

              if (hasConflict) {
                return showConfigMergeDialog(finalYaml);
              }

              return Promise.reject(error);
            }
          }

          async function formatYaml(yaml) {
            return BitriseYmlApi.formatYml(yaml)
              .then((formattedYaml) => formattedYaml)
              .catch(() => yaml);
          }

          /**
           * @returns {Promise<'cancel' | 'save' | 'force-reload'>}
           */
          async function showConfigMergeDialog(previousFinalYaml = '', shouldReCheckRemoteChanges = true) {
            if (!configMergeDialog.getState().isOpen) {
              segmentTrack('Workflow Editor Config Merge Popup Shown', {
                tab_name: viewModel.currentMenu.id,
              });
            }

            viewModel.deferredConflictResolution = $q.defer();

            if (shouldReCheckRemoteChanges) {
              ({ content: remoteConfig, version: remoteVersion } = isYmlFormat
                ? await requestService.getAppConfigYML()
                : await appService.getNormalizedAppConfig());

              const [baseYaml, yourYaml, remoteYaml] = await Promise.all([
                formatYaml(isYmlFormat ? appService.savedAppConfigYML : BitriseYmlApi.toYml(appService.savedAppConfig)),
                previousFinalYaml ||
                  formatYaml(isYmlFormat ? appService.appConfigYML : BitriseYmlApi.toYml(appService.appConfig)),
                formatYaml(isYmlFormat ? remoteConfig : BitriseYmlApi.toYml(remoteConfig)),
              ]);

              configMergeDialog.setState({
                baseYaml,
                yourYaml,
                remoteYaml,
                isOpen: true,
                isLoading: false,
              });
            }

            let finalYaml;

            try {
              ({ finalYaml } = await viewModel.deferredConflictResolution.promise);
              const mode = await saveWithConflictResolution(finalYaml, 'force-reload');
              return mode;
            } catch (error) {
              if (!error) return 'cancel';
              configMergeDialog.setState({
                errorMessage: error.message,
                isLoading: false,
              });
              return showConfigMergeDialog(finalYaml, false);
            }
          }

          /**
           * @param {'cancel' | 'save' | 'force-reload'} method
           */
          async function endSavingProcess(method) {
            if (method !== 'cancel') {
              const isStackAndMachinesMenu = viewModel.currentMenu.id === 'stack';
              const enableWfeReactStacksPage = useFeatureFlag('enable-wfe-react-stacks-and-machines-page');
              if (isStackAndMachinesMenu && !enableWfeReactStacksPage) {
                viewModel.loadDataProgress.start('Loading, wait a sec...');
              }

              try {
                await Promise.all([appService.getAppConfig(true), appService.getAppConfigYML(true)]);
                if (isStackAndMachinesMenu) {
                  await appService.getStackAndDockerImage(true);
                }
              } finally {
                viewModel.loadDataProgress.reset();
              }

              try {
                await updateLastWorkflowMetadata();
              } catch (error) {
                logger.warn('Failed to update last workflow metadata', error);
              }
            }

            viewModel.saveProgress.reset();
            configMergeDialog.setState(configMergeDialog.getInitialState());
            $rootScope.$emit('MainController::saveSuccess', {
              forceReload: method === 'force-reload',
              menu: viewModel.currentMenu.id,
            });

            safeDigest($scope);
          }

          if (shouldReturnPromise) {
            return startSavingProcess();
          }

          startSavingProcess();
        };

        viewModel.isSaveEnabled = function () {
          if (!viewModel.menuProgress.isIdle) {
            return false;
          }

          if (viewModel.loadDataProgress.isInProgress) {
            return false;
          }

          if (viewModel.saveProgress.isInProgress) {
            return false;
          }

          if (!viewModel.hasUnsavedChanges()) {
            return false;
          }
          return true;
        };

        viewModel.isDiscardEnabled = function () {
          return viewModel.isSaveEnabled();
        };

        viewModel.isDiffEnabled = function () {
          return viewModel.isSaveEnabled();
        };

        $(document).on('keydown', function (event) {
          if ((event.ctrlKey || event.metaKey) && event.which === 83) {
            event.preventDefault();

            if (viewModel.isSaveEnabled()) {
              viewModel.save({
                source: 'save_changes_keyboard_shortcut_pressed',
              });
            }

            if (configMergeDialog.getState().isOpen && !configMergeDialog.getState().isLoading) {
              viewModel.saveConfigMergeDialogResult();
            }

            return false;
          }
        });

        viewModel.discardChangesSelected = function () {
          segmentTrack('Workflow Editor Discard Button Clicked', {
            tab_name: viewModel.currentMenu.id,
          });

          switch (viewModel.currentMenu.id) {
            case 'workflows':
            case 'pipelines':
            case 'step_bundles':
            case 'env-vars':
            case 'triggers':
              appService.discardAppConfigChanges();

              break;
            case 'secrets':
              break;
            case 'licenses':
              appService.discardAppConfigChanges();

              break;
            case 'stack':
              appService.discardAppConfigChanges();
              appService.discardStackChanges();
              appService.discardDefaultMachineTypeChanges();

              break;
            case 'yml':
              appService.discardAppConfigYMLChanges();

              break;
          }

          $rootScope.$emit('MainController::discardChanges');
          safeDigest($scope);
        };

        viewModel.selectMenuByID = function (menuID) {
          let selectedMenu = _.find(viewModel.menus, {
            id: menuID,
          });

          if (!selectedMenu) {
            selectedMenu = _.find(viewModel.menus, {
              id: 'workflows',
            });
          }

          viewModel.menuSelected(selectedMenu);
        };

        viewModel.breadCrumbsAccountPath = function () {
          if (
            !appService.appDetails ||
            appService.appDetails.ownerData === undefined ||
            appService.appDetails.ownerData.slug === undefined
          ) {
            return undefined;
          }

          if (appService.appDetails.ownerData.type === 'User') {
            if (appService.appDetails.isCurrentUserOwner) {
              return '/dashboard#?only_direct=true';
            }
            return `/dashboard#?user_slug=${appService.appDetails.ownerData.slug}`;
          }

          if (appService.appDetails.ownerData.type === 'Organization') {
            return `/dashboard#?organization_slug=${appService.appDetails.ownerData.slug}`;
          }
        };

        viewModel.init = function () {
          viewModel.initAppProgress.start('Loading, wait a sec...');

          logger.info('App start');

          appService.getAppConfig();

          $q(function (resolve, reject) {
            if (RuntimeUtils.isLocalMode()) {
              resolve();
              return;
            }

            if (!PageProps.appSlug()) {
              return reject('No app slug specified.');
            }

            requestService
              .getCurrentUserMetadata('last_workflow_edited_date')
              .then((lastWFEDateMetadataResp) => {
                viewModel.lastWorkflowEditedDate = lastWFEDateMetadataResp;
              })
              .finally(() => {
                appService.getAppDetails().then(appService.getOrgBetaTags).then(resolve, reject);
              });
          })
            .then(
              function () {
                if (RuntimeUtils.isWebsiteMode()) {
                  viewModel.defaultBranch = appService.appDetails.defaultBranch;
                  viewModel.gitRepoSlug = appService.appDetails.gitRepoSlug;
                }
                if (RuntimeUtils.isWebsiteMode() && appService.appDetails.isMachineTypeSelectorAvailable) {
                  const stackMenu = _.find(viewModel.menus, {
                    id: 'stack',
                  });
                  stackMenu.title = 'Stacks and Machines';
                }

                if (RuntimeUtils.isWebsiteMode() && appService.appDetails.isCurrentUserIsOrgOwner) {
                  const licensesMenu = _.find(viewModel.menus, {
                    id: 'licenses',
                  });
                  licensesMenu.cssClass = 'licenses';
                }

                viewModel.initAppProgress.success();
              },
              function (error) {
                viewModel.initAppProgress.error(error);
              },
            )
            .then(function () {
              selectInitialMenu();
            });
        };

        viewModel.shouldShowMenuBar = function () {
          if (RuntimeUtils.isLocalMode()) {
            return true;
          }

          return appService.appDetails !== undefined;
        };

        viewModel.isTabEnabledForMenu = function (menu) {
          if (menu && menu.id === 'yml') {
            return true;
          }

          if (menu && menu.id === 'stack') {
            if (viewModel.loadDataProgress.statusMessage === 'Invalid machine type set in bitrise.yml meta') {
              return true;
            }
          }

          return viewModel.initAppProgress.isIdle && viewModel.loadDataProgress.isIdle;
        };

        viewModel.isMenuEnabled = function (menu) {
          if (viewModel.menuProgress.isInProgress || viewModel.saveProgress.isInProgress) {
            return false;
          }

          return viewModel.isTabEnabledForMenu(menu);
        };

        viewModel.appOwnerNameWithPlaceholder = function () {
          return appService.appDetails?.ownerData?.name || 'Unknown owner';
        };

        viewModel.appNameWithPlaceholder = function () {
          return appService.appDetails?.title || 'Unknown app';
        };

        viewModel.saveSecretsFromReact = function (secretsFromReact) {
          if (!appService.secrets) {
            appService.secrets = [];
          }

          // delete the ones that got removed.
          appService.secrets = appService.secrets.filter((secret) => {
            // leave workspace secrets intact
            if (secret.scope() === 'workspace') return true;

            // remove the ones that are not in the react list
            return secretsFromReact.find((s) => !s.isShared && s.key === secret.key());
          });

          // edit existing ones
          appService.secrets.forEach((secret) => {
            if (secret.scope() === 'workspace') return;

            const updatedSecret = secretsFromReact.find((s) => !s.isShared && s.key === secret.key());

            if (updatedSecret) {
              secret.value(updatedSecret.value);
              secret.isProtected(updatedSecret.isProtected);
              secret.isExpose(updatedSecret.isExpose);
              secret.isExpand(updatedSecret.isExpand);
            }

            return secret;
          });

          // add new ones
          secretsFromReact.forEach((secret) => {
            if (secret.isShared) return;

            const existingSecret = appService.secrets.find((s) => s.scope() !== 'workspace' && s.key() === secret.key);

            if (!existingSecret) {
              const newVariable = new Variable(
                {
                  '': '',
                },
                Variable.defaultVariableConfig(),
              );

              newVariable.key(secret.key);
              newVariable.value(secret.value);
              newVariable.isProtected(secret.isProtected);
              newVariable.isExpose(secret.isExpose);
              newVariable.isExpand(secret.isExpand);

              appService.secrets.push(newVariable);
            }
          });

          appService.saveSecrets();
        };

        window.parent.addEventListener('navigation.replace', (e) => {
          const menu = viewModel.menus.find((m) => `/${m.path}` === e.detail.path);

          if (menu) {
            viewModel.menuSelected(menu, e.detail.params);
          }
        });

        window.addEventListener('hashchange', (e) => {
          const oldHash = new URL(e.oldURL).hash;
          const newHash = new URL(e.newURL).hash;

          if (oldHash !== newHash) {
            const newMenuPath = newHash.replace('#!/', '')?.split('?')[0];
            const newParams = Object.fromEntries(new URLSearchParams(new URL(e.newURL).search));
            const newMenu = viewModel.menus.find((m) => m.path === newMenuPath);
            viewModel.menuSelected(newMenu, newParams);
          }
        });

        if (window !== window.parent) {
          window.parent.addEventListener('hashchange', (e) => {
            const oldHash = new URL(e.oldURL).hash;
            const newHash = new URL(e.newURL).hash;

            if (oldHash !== newHash) {
              window.location.hash = newHash;
            }
          });
        }
      },
    );
})();

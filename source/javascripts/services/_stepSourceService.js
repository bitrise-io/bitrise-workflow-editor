(function () {
  angular.module('BitriseWorkflowEditor').factory('stepSourceService', [
    '$q',
    'requestService',
    'appService',
    'semverService',
    'stepLibSearchService',
    'logger',
    'Step',
    function ($q, requestService, appService, semverService, stepLibSearchService, logger, Step) {
      const BITRISE_STEPLIB = 'https://github.com/bitrise-io/bitrise-steplib.git';
      const stepSourceService = {
        defaultLibraryURL: undefined,
        libraries: [],
        localSteps: [],
        gitSteps: [],
      };

      const LATEST_VERSION = null;

      const getLibraryForStep = function (step) {
        if (!step.isLibraryStep()) {
          return null;
        }

        const library = _.find(stepSourceService.libraries, {
          url: step.libraryURL,
        });

        if (!library) {
          throw new Error('Library not found for step');
        }

        return library;
      };

      const logStepVersionMissing = function (step, requestedVersion, library) {
        logger.warn('Step version could not be resolved', {
          id: step.id,
          version: step.version,
          requestedVersion,
          stepsLength: Object.keys(library.steps).length,
        });
      };

      const configureStepFromLib = function (step, library) {
        const requestedVersion = semverService.resolveVersion(step.version, step.id, library);
        const stepVersions = library.steps[step.id];
        const shouldLoadStep = requestedVersion && stepVersions && stepVersions[requestedVersion];

        const messageTags = {
          stepCVS: step.cvs,
          library: library.url,
        };

        try {
          if (shouldLoadStep) {
            step.version = semverService.normalizeVersion(step.version);
            const stepInLibrary = library.steps[step.id][requestedVersion];
            step.defaultStepConfig = stepInLibrary.defaultStepConfig;
            step.info = stepInLibrary.info;
          }

          if (!step.isConfigured()) {
            logger.warn('Step is not configured', messageTags);
          }
        } catch (error) {
          logger.error(error, messageTags);
        }
      };

      stepSourceService.stepFromCVS = function (cvs) {
        const step = new Step(cvs);

        const idStartIndex = cvs.indexOf('::') !== -1 ? cvs.indexOf('::') + 2 : 0;
        const versionStartIndex =
          cvs.lastIndexOf('@') !== -1 && cvs.indexOf('::') < cvs.lastIndexOf('@') ? cvs.lastIndexOf('@') + 1 : -1;

        const source =
          idStartIndex > 0 && cvs.slice(0, idStartIndex - 2).length > 0 ? cvs.slice(0, idStartIndex - 2) : null;
        const id = cvs.slice(idStartIndex, versionStartIndex !== -1 ? versionStartIndex - 1 : undefined);
        const version =
          versionStartIndex !== -1 && versionStartIndex !== cvs.length ? cvs.slice(versionStartIndex) : LATEST_VERSION;

        if (!step.isWithBlock()) {
          switch (source) {
            case 'path': {
              if (id.length === 0) {
                throw new Error('Path not specified.');
              }

              step.localPath = id;

              const localStep = _.find(stepSourceService.localSteps, {
                localPath: step.localPath,
              });

              if (localStep) {
                step.defaultStepConfig = localStep.defaultStepConfig;
              }

              break;
            }
            case 'git': {
              if (id.length === 0) {
                throw new Error('Git URL not specified.');
              }

              step.gitURL = id;
              step.version = version;

              const gitStep = _.find(stepSourceService.gitSteps, {
                gitURL: step.gitURL,
                version: step.version,
              });

              if (gitStep) {
                step.defaultStepConfig = gitStep.defaultStepConfig;
              }

              break;
            }
            case 'bundle':
              break;
            default: {
              if (!source && !stepSourceService.defaultLibraryURL) {
                throw new Error('Step library not specified.');
              }

              if (id.length === 0) {
                throw new Error('Step ID not specified.');
              }

              step.libraryURL = source !== null ? source : stepSourceService.defaultLibraryURL;
              step.id = id;
              step.version = version;

              const library = _.find(stepSourceService.libraries, {
                url: step.libraryURL,
              });

              if (!library) {
                break;
              }

              configureStepFromLib(step, library);
            }
          }
        }

        return step;
      };

      stepSourceService.versionsOfStep = function (step) {
        let library;

        try {
          library = getLibraryForStep(step);

          if (!library) {
            return step.isLocal() ? null : [step.version];
          }
        } catch (err) {
          logger.error(err);
          return null;
        }

        return semverService.extractWildcardVersions(step, library);
      };

      stepSourceService.latestVersion = function (step) {
        const library = getLibraryForStep(step);
        return library && library.latestStepVersions[step.id];
      };

      stepSourceService.isLatestStepVersion = function (step) {
        const library = getLibraryForStep(step);

        if (!library) {
          // broken state
          return !step.isLocal();
        }

        const stepVersion = semverService.resolveVersion(step.version, step.id, library);

        if (!stepVersion) {
          logStepVersionMissing(step, step.version, library);
        }

        return stepVersion === stepSourceService.latestVersion(step);
      };

      stepSourceService.changeStepToVersion = function (step, version) {
        const library = getLibraryForStep(step);

        if (!library) {
          return;
        }

        const indexOfVersionInCurrentCVS = step.cvs.lastIndexOf('@') !== -1 ? step.cvs.lastIndexOf('@') + 1 : -1;
        if (indexOfVersionInCurrentCVS !== -1) {
          step.cvs = step.cvs.slice(0, indexOfVersionInCurrentCVS - 1);
        }

        version = version || semverService.findLatestMajorVersion(step, library);

        step.cvs += `@${semverService.shortenWildcardVersion(version)}`;
        step.version = version;

        configureStepFromLib(step, library);
      };

      stepSourceService.resolveRequestedStepVersion = function (requestedVersion, step) {
        const library = getLibraryForStep(step);

        if (!library) {
          return requestedVersion;
        }

        const version = semverService.resolveVersion(requestedVersion, step.id, library);

        if (!version) {
          logStepVersionMissing(step, requestedVersion, library);
        }

        return version;
      };

      stepSourceService.loadStepsWithCVSs = function (CVSs, requestConfig) {
        const loadPromises = [];
        const libraryURLs = [];
        const stepLibSearchCVSs = [];
        let error;

        const defaultStepLibUrl = appService.appConfig.default_step_lib_source;
        _.every(CVSs, function (aCVS) {
          let step;
          try {
            step = stepSourceService.stepFromCVS(aCVS);
          } catch (_error) {
            error = _error;

            return false;
          }

          if (step.libraryURL !== undefined && !isStepInLib(step)) {
            if (step.libraryURL === BITRISE_STEPLIB) {
              stepLibSearchCVSs.push(aCVS.replace(BITRISE_STEPLIB, '').replace('::', ''));
            } else {
              libraryURLs.push(step.libraryURL);
            }
          } else if (step.localPath !== undefined) {
            if (requestService.mode === 'cli') {
              loadPromises.push(loadStepWithCVS(aCVS, requestConfig));
            }
          } else if (step.gitURL !== undefined) {
            loadPromises.push(
              $q(function (resolve, reject) {
                loadStepWithCVS(aCVS, requestConfig).then(
                  function (defaultStepConfig) {
                    resolve(defaultStepConfig);
                  },
                  function (_error) {
                    if (requestService.mode === 'cli') {
                      reject(_error);
                    } else {
                      logger.error(_error);

                      resolve(null);
                    }
                  },
                );
              }),
            );
          }

          return true;
        });

        if (error) {
          logger.error(error);
          return $q.reject(error);
        }

        if (libraryURLs.length) {
          loadPromises.push(stepSourceService.loadLibrariesWithURLs(libraryURLs, requestConfig));
        }

        if (stepLibSearchCVSs.length) {
          const stepLibSearchPromise = stepLibSearchService
            .list({
              stepCVSs: stepLibSearchCVSs,
              includeInputs: true,
            })
            .then(function (steps) {
              addStepsToDefaultLibrary(steps);
            });

          loadPromises.push(stepLibSearchPromise);
        }

        return $q.all(loadPromises);
      };

      function isStepInLib(step) {
        const library = stepSourceService.libraries.find(function (lib) {
          return lib.url === step.libraryURL;
        });
        if (!library || !library.steps || !library.steps[step.id]) {
          return false;
        }

        if (!step.version) {
          const latestStepVersion = library.latestStepVersions[step.id];
          return !!library.steps[step.id][latestStepVersion];
        }
        return !!semverService.resolveVersion(step.version, step.id, library);
      }

      function addStepsToDefaultLibrary(steps) {
        Object.keys(steps).forEach(function (stepId) {
          const stepVersions = {};
          let latestStepVersion;

          Object.values(steps[stepId].versions)
            // We need to order versions, so the last step version processed
            // will be the latest version
            .sort(function (v1, v2) {
              return semverService.sort(v1.version, v2.version);
            })
            .forEach(function (stepVersion) {
              const step = new Step(stepVersion.cvs);
              step.info = stepVersion.info;
              latestStepVersion = stepVersion.latest_version_number;
              step.libraryURL = BITRISE_STEPLIB;
              step.id = stepVersion.id;
              step.version = stepVersion.version;
              step.defaultStepConfig = { ...stepVersion, ...stepVersion.step };
              stepVersions[stepVersion.version] = step;
            });

          let library;
          library = stepSourceService.libraries.find(function (lib) {
            return lib.url === BITRISE_STEPLIB;
          });

          if (!library) {
            library = {
              url: BITRISE_STEPLIB,
              steps: {},
              latestStepVersions: {},
            };

            stepSourceService.libraries.push(library);
          }

          library.steps[stepId] = { ...library.steps[stepId], ...stepVersions };
          library.latestStepVersions[stepId] = latestStepVersion;
        });
      }

      stepSourceService.loadStepVersions = function (stepId) {
        // This only works for official Bitrise steps
        return stepLibSearchService.getStepVersions(stepId).then(function (step) {
          const steps = {};
          steps[stepId] = step;
          addStepsToDefaultLibrary(steps);
        });
      };

      function loadStepWithCVS(cvs, requestConfig) {
        let step;
        try {
          step = stepSourceService.stepFromCVS(cvs);

          if (
            step.libraryURL !== undefined &&
            _.find(stepSourceService.libraries, {
              url: step.libraryURL,
            })
          ) {
            return $q.when();
          }

          if (
            step.localPath !== undefined &&
            _.find(stepSourceService.localSteps, {
              localPath: step.localPath,
            })
          ) {
            return $q.when();
          }

          if (
            step.gitURL !== undefined &&
            _.find(stepSourceService.gitSteps, {
              gitURL: step.gitURL,
              version: step.version,
            })
          ) {
            return $q.when();
          }
        } catch (error) {
          logger.error(error);
          return $q.reject(error);
        }

        return requestService.stepConfigFetch(step, requestConfig).then(function (defaultStepConfig) {
          step.defaultStepConfig = defaultStepConfig;
          if (step.localPath) {
            stepSourceService.localSteps.push(step);
          } else if (step.gitURL) {
            stepSourceService.gitSteps.push(step);
          } else {
            // TODO: implement single library step load if neccessary
            logger.warn('Single library step load not implemented');
          }
        });
      }

      function normalizeStepLib(steps, libraryURL) {
        const library = {
          url: libraryURL,
        };

        const stepIDs = _.keys(steps).sort();

        library.steps = {};
        library.latestStepVersions = {};
        _.each(stepIDs, function (aStepID) {
          const stepData = steps[aStepID];
          const latestVersion =
            stepData.latest_version_number || Object.values(stepData.versions).shift().latest_version_number;

          library.steps[aStepID] = {};
          library.latestStepVersions[aStepID] = latestVersion;
          library.steps[aStepID] = _.mapObject(stepData.versions, function (aStepConfig, version) {
            const cvs = `${library.url}::${aStepID}@${version}`;

            const step = stepSourceService.stepFromCVS(cvs);
            step.defaultStepConfig = aStepConfig;

            return step;
          });
        });

        return library;
      }

      stepSourceService.loadLatestOfficialSteps = function (projectType) {
        const projectTypes = projectType && [projectType];

        return stepLibSearchService
          .list({ latestOnly: true, projectTypes, includeDeprecated: false })
          .then(function (steps) {
            addStepsToDefaultLibrary(steps);
          });
      };

      stepSourceService.searchOfficialSteps = function (query) {
        return stepLibSearchService
          .fuzzySearch({ query, latestOnly: true, attributesToRetrieve: ['id', 'version', 'cvs'] })
          .then(function (steps) {
            return Object.keys(steps);
          });
      };

      stepSourceService.loadLibrariesWithURLs = function (libraryURLs, requestConfig) {
        return $q(function (resolve, reject) {
          const notLoadedLibraryURLs = _.reject(_.uniq(libraryURLs), function (aLibraryURL) {
            return _.find(stepSourceService.libraries, {
              url: aLibraryURL,
            });
          });

          if (notLoadedLibraryURLs.length === 0) {
            resolve();

            return;
          }

          return requestService.libraryFetch(notLoadedLibraryURLs, requestConfig).then(
            function (data) {
              _.each(data, function (aLibraryData, aLibraryURL) {
                try {
                  const library = normalizeStepLib(aLibraryData.steps, aLibraryURL);

                  stepSourceService.libraries.push(library);

                  resolve();
                } catch (error) {
                  logger.error(error);
                  reject(new Error('Error loading library.'));
                }
              });
            },
            function (error) {
              logger.error(error);
              reject(error);
            },
          );
        });
      };

      return stepSourceService;
    },
  ]);
})();

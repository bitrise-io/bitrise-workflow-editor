import { type EditorProps, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';

import AlgoliaApi from '../api/AlgoliaApi';
import EnvVarsApi from '../api/EnvVarsApi';
import SecretApi from '../api/SecretApi';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import BitriseYmlService from '../services/BitriseYmlService';
import StepService from '../services/StepService';
import { bitriseYmlStore } from '../stores/BitriseYmlStore';
import PageProps from './PageProps';
import RuntimeUtils from './RuntimeUtils';
import VersionUtils from './VersionUtils';

type BeforeMountHandler = Exclude<EditorProps['beforeMount'], undefined>;

// Get the CDN URL based on environment variables
const getWorkerBaseUrl = () => {
  if (RuntimeUtils.isProduction()) {
    // In production, use the CDN URLs from environment variables
    const publicUrlRoot = process.env.PUBLIC_URL_ROOT || '';
    const version = process.env.WFE_VERSION || '';
    return `${publicUrlRoot}/${version}/javascripts/`;
  }

  // In development, use the import.meta.url approach
  return '';
};

// Store the base URL to prevent recalculating it
const workerBaseUrl = getWorkerBaseUrl();

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (RuntimeUtils.isProduction()) {
      // In production, load workers directly from the CDN
      const workerPath = label === 'yaml' ? 'yaml.worker.js' : 'editor.worker.js';
      console.log(`[MonacoUtils] Loading worker from CDN: ${workerBaseUrl}${workerPath}`);
      return new Worker(`${workerBaseUrl}${workerPath}`, { type: 'module' });
    }

    // In development, use the module URLs
    switch (label) {
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url), { type: 'module' });
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), { type: 'module' });
    }
  },
};

loader.config({ monaco });

let isConfiguredForYaml = false;

const configureForYaml: BeforeMountHandler = (monacoInstance) => {
  if (isConfiguredForYaml) {
    return;
  }

  try {
    configureMonacoYaml(monacoInstance, {
      hover: true,
      format: true,
      validate: true,
      completion: true,
      enableSchemaRequest: true,
      schemas: [{ fileMatch: ['*'], uri: `https://json.schemastore.org/bitrise.json?t=${Date.now()}` }],
    });

    isConfiguredForYaml = true;
    console.log('[MonacoUtils] YAML configuration successfully applied');
  } catch (error) {
    console.error('[MonacoUtils] Error configuring YAML:', error);
  }
};

let isConfiguredForEnvVarsCompletionProvider = false;

const configureEnvVarsCompletionProvider: BeforeMountHandler = (monacoInstance) => {
  if (isConfiguredForEnvVarsCompletionProvider) {
    return;
  }

  monacoInstance.languages.registerCompletionItemProvider(['yaml', 'shell'], {
    triggerCharacters: ['$'],
    async provideCompletionItems(model, position, _, token) {
      const appSlug = PageProps.appSlug();
      const { yml } = bitriseYmlStore.getState();
      const projectType = yml?.project_type || 'other';
      const steplib = yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL;

      const abortController = new AbortController();
      const lineContent = model.getLineContent(position.lineNumber);
      const wordUntilPosition = model.getWordUntilPosition(position);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordUntilPosition.startColumn,
        endColumn: wordUntilPosition.endColumn,
      };

      // Check if we're in a variable context (after $ character)
      const textUntilPosition = lineContent.substring(0, position.column - 1);
      if (!textUntilPosition.endsWith('$') && !textUntilPosition.match(/\$[\w_]*$/)) {
        return { suggestions: [] };
      }

      // Load project level env vars
      const projectLevelEnvVars = yml?.app?.envs || [];
      const suggestions: monaco.languages.CompletionItem[] = projectLevelEnvVars.map(({ opts, ...env }) => {
        const key = Object.keys(env)[0];

        return {
          range,
          label: `${key}`,
          insertText: key,
          sortText: `${key}`,
          detail: 'from project level env vars',
          kind: monacoInstance.languages.CompletionItemKind.Variable,
        } satisfies monaco.languages.CompletionItem;
      });

      // Load workflow level env vars
      Object.entries(yml.workflows ?? {}).forEach(([workflowName, workflow]) => {
        const workflowEnvVars = workflow?.envs || [];
        workflowEnvVars.forEach(({ opts, ...env }) => {
          const key = Object.keys(env)[0];

          if (suggestions.some((s) => s.label === key)) {
            return;
          }

          suggestions.push({
            range,
            label: `${key}`,
            insertText: key,
            sortText: `${key}`,
            detail: `from ${workflowName} workflow`,
            kind: monacoInstance.languages.CompletionItemKind.Variable,
          } satisfies monaco.languages.CompletionItem);
        });
      });

      token.onCancellationRequested(() => abortController.abort());

      async function loadEnvVars() {
        const envVars = await EnvVarsApi.getEnvVars({ appSlug, projectType, signal: abortController.signal });

        envVars.forEach(({ key, source }) => {
          if (suggestions.some((s) => s.label === key)) {
            return;
          }

          suggestions.push({
            range,
            label: `${key}`,
            insertText: key,
            sortText: `${key}`,
            detail: `from ${source}`,
            kind: monacoInstance.languages.CompletionItemKind.Variable,
          } satisfies monaco.languages.CompletionItem);
        });
      }

      async function loadSecrets() {
        const projectLevelSecrets = await SecretApi.getSecrets({ appSlug, signal: abortController.signal });

        projectLevelSecrets.forEach(({ key }) => {
          suggestions.push({
            range,
            label: `${key}`,
            insertText: key,
            sortText: `${key}`,
            detail: 'from project level secrets',
            kind: monacoInstance.languages.CompletionItemKind.Variable,
          } satisfies monaco.languages.CompletionItem);
        });
      }

      async function loadStepOutputs() {
        const cvss = BitriseYmlService.getUniqueStepCvss(yml).filter((cvs) => {
          return StepService.isBitriseLibraryStep(cvs, steplib);
        });

        const idSet = new Set<string>();
        cvss.forEach((cvs) => idSet.add(StepService.parseStepCVS(cvs, steplib).id));
        const ids = Array.from(idSet);

        const availableStepVersions = await AlgoliaApi.getAllAvailableVersionsByIds(ids);

        const resolvedCvsSet = new Set<string>();
        cvss.forEach((cvs) => {
          const { id, version } = StepService.parseStepCVS(cvs, steplib);
          const availableVersions = Array.from(availableStepVersions.get(id) ?? []);
          const resolvedVersion = VersionUtils.resolveVersion(version, availableVersions);
          resolvedCvsSet.add(`${id}@${resolvedVersion}`);
        });
        const resolvedCvs = Array.from(resolvedCvsSet);

        const steps = await AlgoliaApi.getStepsByMultipleCvs(resolvedCvs, ['id', 'step.outputs']);

        steps.forEach(({ id, step }) => {
          (step?.outputs ?? []).forEach(({ opts, ...env }) => {
            const key = Object.keys(env)[0];

            if (suggestions.some((s) => s.label === key)) {
              return;
            }

            suggestions.push({
              range,
              label: `${key}`,
              insertText: key,
              sortText: `${key}`,
              detail: `from ${id} step`,
              kind: monacoInstance.languages.CompletionItemKind.Variable,
            } satisfies monaco.languages.CompletionItem);
          });
        });
      }

      await Promise.all([loadEnvVars(), loadSecrets(), loadStepOutputs()]);

      return { suggestions };
    },
  });

  isConfiguredForEnvVarsCompletionProvider = true;
};

export default {
  configureForYaml,
  configureEnvVarsCompletionProvider,
};

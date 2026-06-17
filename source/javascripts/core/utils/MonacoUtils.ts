import { configureBitriseYaml } from '@bitrise/languageserver/monaco';
import { type EditorProps, loader } from '@monaco-editor/react';
import { debounce } from 'es-toolkit';
import * as monaco from 'monaco-editor';
import { type languages } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';

import AlgoliaApi from '../api/AlgoliaApi';
import EnvVarsApi from '../api/EnvVarsApi';
import SecretApi from '../api/SecretApi';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import BitriseYmlService from '../services/BitriseYmlService';
import StepService from '../services/StepService';
import { getBitriseYml } from '../stores/BitriseYmlStore';
import PageProps from './PageProps';
import VersionUtils from './VersionUtils';

type BeforeMountHandler = Exclude<EditorProps['beforeMount'], undefined>;

loader.config({ monaco });

let isConfiguredForYaml = false;
const configureForYaml: BeforeMountHandler = (monacoInstance) => {
  if (isConfiguredForYaml) {
    return;
  }

  // TODO: Skip YAML worker configuration in dev WEBSITE mode due to cross-origin restrictions
  if (!(window.env?.MODE === 'WEBSITE' && window.env?.NODE_ENV !== 'production')) {
    configureMonacoYaml(monacoInstance, {
      hover: true,
      format: true,
      validate: true,
      completion: true,
      yamlVersion: '1.1',
      enableSchemaRequest: true,
      schemas: [{ fileMatch: ['*'], uri: `https://www.schemastore.org/bitrise.json?t=${Date.now()}` }],
    });
  }

  isConfiguredForYaml = true;
};

let isConfiguredForEnvVarsCompletionProvider = false;
const configureEnvVarsCompletionProvider: BeforeMountHandler = (monacoInstance) => {
  if (isConfiguredForEnvVarsCompletionProvider) {
    return;
  }

  monacoInstance.languages.registerCompletionItemProvider(['yaml', 'shell'], {
    triggerCharacters: ['$'],
    async provideCompletionItems(model, position, _, token) {
      const yml = getBitriseYml();
      const appSlug = PageProps.appSlug();
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
      const suggestions: languages.CompletionItem[] = projectLevelEnvVars.map(({ opts: _, ...env }) => {
        const key = Object.keys(env)[0];

        return {
          range,
          label: `${key}`,
          insertText: key,
          sortText: `${key}`,
          detail: 'from project level env vars',
          kind: monacoInstance.languages.CompletionItemKind.Variable,
        } satisfies languages.CompletionItem;
      });

      // Load workflow level env vars
      Object.entries(yml.workflows ?? {}).forEach(([workflowName, workflow]) => {
        const workflowEnvVars = workflow?.envs || [];
        workflowEnvVars.forEach(({ opts: _, ...env }) => {
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
          } satisfies languages.CompletionItem);
        });
      });

      token.onCancellationRequested(() => abortController.abort('Completion request cancelled by Monaco editor'));

      async function loadEnvVarsAndSecrets() {
        const [envVars, projectLevelSecrets, codeSigningSecrets] = await Promise.all([
          EnvVarsApi.getEnvVars({ appSlug, projectType, signal: abortController.signal }),
          SecretApi.getSecrets({ appSlug, signal: abortController.signal }),
          SecretApi.getCodeSigningSecrets({ appSlug, projectType, signal: abortController.signal }),
        ]);

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
          } satisfies languages.CompletionItem);
        });

        projectLevelSecrets.forEach(({ key }) => {
          if (suggestions.some((s) => s.label === key)) {
            return;
          }

          suggestions.push({
            range,
            label: `${key}`,
            insertText: key,
            sortText: `${key}`,
            detail: 'from project level secrets',
            kind: monacoInstance.languages.CompletionItemKind.Variable,
          } satisfies languages.CompletionItem);
        });

        codeSigningSecrets.forEach(({ key, source }) => {
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
          } satisfies languages.CompletionItem);
        });
      }

      async function loadStepOutputs() {
        const cvss = BitriseYmlService.getUniqueStepCvss().filter((cvs) => {
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
          (step?.outputs ?? []).forEach(({ opts: _, ...env }) => {
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
            } satisfies languages.CompletionItem);
          });
        });
      }

      try {
        await Promise.all([loadEnvVarsAndSecrets(), loadStepOutputs()]);
      } catch (error) {
        if (abortController.signal.aborted) {
          return { suggestions: [] };
        }
        throw error;
      }

      return { suggestions };
    },
  });

  isConfiguredForEnvVarsCompletionProvider = true;
};

let isConfiguredForBitriseLanguageServer = false;
const configureBitriseLanguageServer: BeforeMountHandler = (monacoInstance) => {
  if (isConfiguredForBitriseLanguageServer) {
    return;
  }

  configureBitriseYaml(monacoInstance);

  isConfiguredForBitriseLanguageServer = true;
};

export type ValidationStatus = 'valid' | 'invalid' | 'warnings';

/**
 * Subscribes to marker changes on a Monaco model and calls the callback
 * with the derived validation status whenever markers change.
 *
 * Returns an IDisposable to unsubscribe.
 */
function onModelMarkerStatusChange(
  model: monaco.editor.ITextModel,
  callback: (status: ValidationStatus) => void,
): monaco.IDisposable {
  const updateStatus = () => {
    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const hasError = markers.some((m) => m.severity === monaco.MarkerSeverity.Error);
    const hasWarning = markers.some((m) => m.severity === monaco.MarkerSeverity.Warning);

    if (hasError) callback('invalid');
    else if (hasWarning) callback('warnings');
    else callback('valid');
  };

  // Trailing debounce: collapse the multi-owner marker passes (monaco-yaml schema layer
  // + Bitrise LS) that fire during load into a single settled value, so the status never
  // flashes through a transient 'warnings'/'valid' before the real result. The window is
  // wide enough to bridge the gap between monaco-yaml's fast first pass and the slower
  // Bitrise LS settling — a shorter window let the badge leave its skeleton on the
  // premature first pass. The latency is invisible: consumers (the validation badge,
  // the Visual-tab gate) sit behind a skeleton/`'pending'` state until this first fires.
  const debouncedUpdate = debounce(updateStatus, 800);

  debouncedUpdate();

  const subscription = monaco.editor.onDidChangeMarkers((changedUris) => {
    const modelUri = model.uri.toString();
    if (!changedUris.some((uri) => uri.toString() === modelUri)) {
      return;
    }

    debouncedUpdate();
  });

  return {
    dispose: () => {
      debouncedUpdate.cancel();
      subscription.dispose();
    },
  };
}

export default {
  configureForYaml,
  configureBitriseLanguageServer,
  configureEnvVarsCompletionProvider,
  onModelMarkerStatusChange,
};

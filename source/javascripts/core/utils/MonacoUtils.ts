import { type EditorProps, loader } from '@monaco-editor/react';
import { LanguageService } from 'bitrise-yml-lsp-server';
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

type LSRange = {
  start: { line: number; character: number };
  end: { line: number; character: number };
};

function lsRangeToMonacoRange(range: LSRange): monaco.Range;
function lsRangeToMonacoRange(range?: LSRange): monaco.Range | undefined;
function lsRangeToMonacoRange(range?: LSRange): monaco.Range | undefined {
  if (!range) {
    return;
  }

  return new monaco.Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}

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
      schemas: [{ fileMatch: ['*'], uri: `https://json.schemastore.org/bitrise.json?t=${Date.now()}` }],
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
          } satisfies languages.CompletionItem);
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
        await Promise.all([loadEnvVars(), loadSecrets(), loadStepOutputs()]);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
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

  const ls = new LanguageService();

  monacoInstance.languages.registerDefinitionProvider('yaml', {
    provideDefinition: async (model, position) => {
      const uri = model.uri.toString();
      const pos = { line: position.lineNumber - 1, character: position.column - 1 };

      ls.updateFile(uri, model.getValue());

      const definition = ls.provideDefinitionLink(uri, pos);
      if (!definition) {
        return null;
      }

      return [
        {
          uri: model.uri,
          range: lsRangeToMonacoRange(definition.range),
          originSelectionRange: lsRangeToMonacoRange(definition.originSelectionRange),
          targetSelectionRange: lsRangeToMonacoRange(definition.targetSelectionRange),
        },
      ];
    },
  });

  monacoInstance.languages.registerHoverProvider('yaml', {
    provideHover: async (model, position) => {
      const uri = model.uri.toString();
      const pos = { line: position.lineNumber - 1, character: position.column - 1 };

      ls.updateFile(uri, model.getValue());

      const hoverText = ls.provideHover(uri, pos);
      if (!hoverText) {
        return null;
      }

      return {
        contents: [{ value: hoverText }],
      };
    },
  });

  isConfiguredForBitriseLanguageServer = true;
};

export default {
  configureForYaml,
  configureBitriseLanguageServer,
  configureEnvVarsCompletionProvider,
};

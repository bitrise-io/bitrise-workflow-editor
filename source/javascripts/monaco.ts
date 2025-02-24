import { loader } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController';
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController';

import YamlWorker from './monaco-yaml.worker?worker';

window.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'yaml':
        return new YamlWorker();
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

configureMonacoYaml(monaco, {
  hover: true,
  format: true,
  validate: true,
  completion: true,
  enableSchemaRequest: true,
  schemas: [
    {
      uri: 'https://json.schemastore.org/bitrise.json',
      fileMatch: ['*'],
    },
  ],
});

loader.config({ monaco });

export default monaco;

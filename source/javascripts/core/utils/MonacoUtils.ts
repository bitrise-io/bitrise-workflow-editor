import { EditorProps } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

type BeforeMountHandler = Exclude<EditorProps['beforeMount'], undefined>;

window.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

let isConfiguredForYaml = false;

const configureForYaml: BeforeMountHandler = (monaco) => {
  if (isConfiguredForYaml) {
    return;
  }

  configureMonacoYaml(monaco, {
    hover: true,
    format: true,
    validate: true,
    completion: true,
    enableSchemaRequest: true,
    schemas: [{ fileMatch: ['*'], uri: `https://json.schemastore.org/bitrise.json?t=${Date.now()}` }],
  });

  isConfiguredForYaml = true;
};

export default {
  configureForYaml,
};

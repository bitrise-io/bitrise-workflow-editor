import { useEffect, useMemo, useRef, useState } from 'react';
import { languages } from 'monaco-editor';
import { configureMonacoYaml, MonacoYaml } from 'monaco-yaml';
import Editor, { Monaco } from '@monaco-editor/react';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { useWorkflows } from '@/hooks/useWorkflows';
import WindowUtils from '@/core/utils/WindowUtils';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';
import { EnvVar } from '@/core/models/EnvVar';

const EDITOR_OPTIONS = {
  roundedSelection: false,
  scrollBeyondLastLine: false,
  stickyScroll: {
    enabled: true,
  },
};

const MONACO_YAML_OPTIONS = {
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
};

type YmlEditorProps = {
  ciConfigYml: string;
  isLoading?: boolean;
  readOnly: boolean;
  onEditorChange: (changedText?: string) => void;
};

const YmlEditor = (props: YmlEditorProps) => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const { ciConfigYml, isLoading, readOnly, onEditorChange } = props;

  const monacoRef = useRef<Monaco>();
  const [monacoYaml, setMonacoYaml] = useState<MonacoYaml>();

  const workflows = useWorkflows();
  const ids = Object.keys(workflows);
  const { envs } = useEnvVars(ids, true);
  const { data: secrets = [] } = useSecrets({ appSlug });

  const items = useMemo(
    () => [...envs, ...secrets].sort((a, b) => a.key.localeCompare(b.key)) as EnvVar[],
    [envs, secrets],
  );

  const completionProvider: languages.CompletionItemProvider = useMemo(
    () => ({
      triggerCharacters: ['$'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn,
        };

        const suggestions: languages.CompletionItem[] = items.map((item) => ({
          label: item.key,
          insertText: item.key,
          detail: item.source,
          kind: languages.CompletionItemKind.Variable,
          range,
        }));

        return { suggestions };
      },
    }),
    [items],
  );

  useEffect(() => {
    return monacoYaml?.dispose;
  }, [monacoYaml]);

  useEffect(() => {
    const disposable = monacoRef.current?.languages.registerCompletionItemProvider('yaml', completionProvider);
    return disposable?.dispose;
  }, [completionProvider]);

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      onChange={onEditorChange}
      value={isLoading ? 'Loading...' : ciConfigYml}
      options={{ ...EDITOR_OPTIONS, readOnly: readOnly || isLoading }}
      beforeMount={(monaco) => {
        monacoRef.current = monaco;
        setMonacoYaml(configureMonacoYaml(monaco, MONACO_YAML_OPTIONS));
      }}
    />
  );
};

const WrappedYmlEditor = (props: YmlEditorProps) => (
  // eslint-disable-next-line react/destructuring-assignment
  <BitriseYmlProvider yml={BitriseYmlApi.fromYml(props.ciConfigYml) as BitriseYml}>
    <YmlEditor {...props} />
  </BitriseYmlProvider>
);

export default WrappedYmlEditor;

import { useEffect, useMemo } from 'react';
import { languages } from 'monaco-editor';
import { Monaco } from '@monaco-editor/react';
import useEnvVarsAndSecrets from '@/hooks/useEnvVarsAndSecrets';

type Props = {
  monaco: Monaco | undefined;
  language: string;
};

const useEnvVarsAndSecretsCompletionProvider = ({ monaco, language }: Props) => {
  const items = useEnvVarsAndSecrets();

  const provider: languages.CompletionItemProvider = useMemo(
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
          documentation: item.source,
          kind: languages.CompletionItemKind.Variable,
          range,
        }));

        return { suggestions };
      },
    }),
    [items],
  );

  useEffect(() => {
    const disposable = monaco?.languages.registerCompletionItemProvider(language, provider);
    return disposable?.dispose;
  }, [monaco, language, provider]);
};

export { useEnvVarsAndSecretsCompletionProvider };

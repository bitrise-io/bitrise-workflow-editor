import { useEffect, useMemo } from 'react';
import { Monaco } from '@monaco-editor/react';
import useEnvVarsAndSecrets from '@/hooks/useEnvVarsAndSecrets';
import monaco from '@/monaco';

type Props = {
  monaco: Monaco | undefined;
  language: string;
};

const useEnvVarsAndSecretsCompletionProvider = ({ monaco: monacoInstance, language }: Props) => {
  const items = useEnvVarsAndSecrets();

  const provider: monaco.languages.CompletionItemProvider = useMemo(
    () => ({
      triggerCharacters: ['$'],
      provideCompletionItems: (model, position) => {
        const wordUntilPosition = model.getWordUntilPosition(position);
        const { startColumn, endColumn } = wordUntilPosition;

        const { lineNumber } = position;
        const lineContent = model.getLineContent(lineNumber);
        // NOTE Needs to be -2 because column is 1-based, and chars are 0-based
        // -1 would get us the char at the cursor
        const prefixPos = startColumn - 2;
        const prefixChar = lineContent.charAt(prefixPos);

        // Word doesn't have $ prefix, so it's not an env var or secret
        if (prefixChar !== '$') {
          return { suggestions: [] };
        }

        const range = {
          startLineNumber: lineNumber,
          startColumn,
          endLineNumber: lineNumber,
          endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = items.map((item) => ({
          label: item.key,
          insertText: item.key,
          detail: item.source,
          kind: monaco.languages.CompletionItemKind.Variable,
          range,
        }));

        return { suggestions };
      },
    }),
    [items],
  );

  useEffect(() => {
    const disposable = monacoInstance?.languages.registerCompletionItemProvider(language, provider);
    return disposable?.dispose;
  }, [monacoInstance, language, provider]);
};

export { useEnvVarsAndSecretsCompletionProvider };

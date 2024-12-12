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
    const disposable = monaco?.languages.registerCompletionItemProvider(language, provider);
    return disposable?.dispose;
  }, [monaco, language, provider]);
};

export { useEnvVarsAndSecretsCompletionProvider };

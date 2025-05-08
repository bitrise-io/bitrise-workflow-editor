import { Box, FilterSwitch, FilterSwitchGroup, Label } from '@bitrise/bitkit';
import { Editor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';

import MonacoUtils from '@/core/utils/MonacoUtils';

import StepMaker from './StepMaker';

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: 'mono',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  stickyScroll: { enabled: true },
  contextmenu: false,
  minimap: { enabled: false },
  padding: { top: 16, bottom: 16 },
};

type Props = {
  label?: string;
  value: string;
  defaultValue?: string;
  onChange: (value: string | null) => void;
};

const StepCodeEditor = ({ label, value, defaultValue, onChange }: Props) => {
  const [editorInstance, setEditor] = useState<editor.IStandaloneCodeEditor>();
  const [state, setState] = useState<'script' | 'ai'>('script');

  const updateEditorHeight = useCallback(() => {
    if (!editorInstance) {
      return;
    }

    const contentHeight = Math.min(editorInstance?.getContentHeight() || 250, window.innerHeight * 0.5);
    requestAnimationFrame(() =>
      editorInstance?.layout({
        height: contentHeight,
        width: editorInstance?.getLayoutInfo().width,
      }),
    );
  }, [editorInstance]);

  useEffect(() => {
    editorInstance?.onDidContentSizeChange(updateEditorHeight);
    updateEditorHeight();
    return undefined;
  }, [editorInstance, updateEditorHeight]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBlockEnd="8">
        {label && <Label>{label}</Label>}
        <FilterSwitchGroup onChange={(v) => setState(v as 'script' | 'ai')} value={state} marginBlockStart="0">
          <FilterSwitch value="script">Script</FilterSwitch>
          <FilterSwitch value="ai">AI input</FilterSwitch>
        </FilterSwitchGroup>
      </Box>
      <Box display={state === 'ai' ? 'none' : 'block'}>
        <Editor
          theme="vs-dark"
          onMount={setEditor}
          defaultLanguage="shell"
          options={EDITOR_OPTIONS}
          value={value || defaultValue}
          onChange={(changedValue) => onChange(changedValue || null)}
          beforeMount={MonacoUtils.configureEnvVarsCompletionProvider}
        />
      </Box>
      <Box display={state === 'ai' ? 'block' : 'none'}>
        <StepMaker />
      </Box>
    </Box>
  );
};

export default StepCodeEditor;

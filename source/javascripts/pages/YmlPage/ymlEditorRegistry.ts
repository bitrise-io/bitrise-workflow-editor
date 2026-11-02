import type { editor } from 'monaco-editor';
import { isMap, isScalar, parseDocument } from 'yaml';

// The YAML page's editor on screen (single-file, a module file, or the merged config), so the sidebar
// can point it at a definition. Each editor registers itself on mount; a disposed one drops out.
let activeEditor: editor.IStandaloneCodeEditor | undefined;

function registerYmlEditor(ymlEditor: editor.IStandaloneCodeEditor) {
  activeEditor = ymlEditor;
  ymlEditor.onDidDispose(() => {
    if (activeEditor === ymlEditor) {
      activeEditor = undefined;
    }
  });
}

export type YmlSection = 'pipelines' | 'workflows' | 'step_bundles';

// Where `id` is defined under the top-level `section` of this YAML text: the offset of its key, or -1.
// Read from the text on screen, so it also works with unsaved edits; a broken document yields -1.
function findDefinitionOffset(text: string, section: YmlSection, id: string): number {
  try {
    const sectionNode = parseDocument(text).get(section, true);
    if (isMap(sectionNode)) {
      const pair = sectionNode.items.find((item) => isScalar(item.key) && String(item.key.value) === id);
      const start = pair && isScalar(pair.key) ? pair.key.range?.[0] : undefined;
      if (start !== undefined) {
        return start;
      }
    }
  } catch {
    // Unparseable text: nothing to point at.
  }
  return -1;
}

// Scrolls the editor to the definition, near the top, and selects its name. False when there's no
// editor or no such definition in what it shows.
function revealYmlDefinition(section: YmlSection, id: string): boolean {
  const model = activeEditor?.getModel();
  if (!activeEditor || !model) {
    return false;
  }
  const offset = findDefinitionOffset(model.getValue(), section, id);
  if (offset < 0) {
    return false;
  }
  const start = model.getPositionAt(offset);
  const end = model.getPositionAt(offset + id.length);
  activeEditor.revealLineNearTop(start.lineNumber);
  activeEditor.setSelection({
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  });
  activeEditor.focus();
  return true;
}

export default { registerYmlEditor, findDefinitionOffset, revealYmlDefinition };

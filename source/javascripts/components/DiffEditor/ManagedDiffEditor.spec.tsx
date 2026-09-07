/**
 * @jest-environment jsdom
 */
import { loader } from '@monaco-editor/react';
import { render, waitFor } from '@testing-library/react';

import ManagedDiffEditor from './ManagedDiffEditor';

// The real `@monaco-editor/react` runs here — only Monaco itself is a stand-in. The whole point of
// this component is the order two cleanups run in (its layout effect against the library's passive
// one), so mocking the library would test the mock. A recorded call log is enough of a Monaco:
// nothing below reaches Monaco behaviour, just its shape.
const calls: string[] = [];

const model = (name: string) => ({ dispose: () => calls.push(`${name}.dispose`) });
let created = 0;

const diffEditor = {
  model: null as unknown,
  getModel() {
    return this.model;
  },
  setModel(next: unknown) {
    calls.push(next ? 'setModel(models)' : 'setModel(null)');
    this.model = next;
  },
  updateOptions: () => {},
  dispose: () => calls.push('editor.dispose'),
};

const monaco = {
  Uri: { parse: (path: string) => ({ path }) },
  editor: {
    getModel: () => null,
    createModel: () => model(created++ === 0 ? 'original' : 'modified'),
    createDiffEditor: () => diffEditor,
    setTheme: () => {},
    EditorOption: { readOnly: 0 },
  },
};

loader.config({ monaco: monaco as never });

describe('ManagedDiffEditor', () => {
  it('resets the widget model before disposing the pair, so Monaco never sees a live widget lose a model', async () => {
    const onMount = jest.fn();
    const { unmount } = render(<ManagedDiffEditor original="a: 1" modified="a: 2" onMount={onMount} />);

    await waitFor(() => expect(onMount).toHaveBeenCalled());
    calls.length = 0;

    unmount();

    // `setModel(null)` first is what keeps `TextModel got disposed before DiffEditorWidget model got
    // reset` out of the console; the two disposes are the leak the `keepCurrent*Model` props stop the
    // library from handling.
    expect(calls).toEqual(['setModel(null)', 'original.dispose', 'modified.dispose', 'editor.dispose']);
  });
});

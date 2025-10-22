// Monaco Editor worker configuration for Vite
// Based on:
// - https://www.npmjs.com/package/@monaco-editor/react#use-monaco-editor-as-an-npm-package
// - https://github.com/remcohaszing/monaco-yaml#why-doesnt-it-work-with-vite

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import YamlWorker from './yaml.worker?worker';

// Configure Monaco Environment to use Vite's worker imports
// Workers are instantiated as Blob URLs, making them same-origin regardless of where assets are hosted
window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

// Monaco Editor worker configuration for Vite
// Workers are served through Cloudflare proxy at /workflow_editor/* (same-origin)
// See: https://github.com/remcohaszing/monaco-yaml#vite

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import YamlWorker from './yaml.worker?worker';

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker: (_moduleId: string, label: string) => Worker;
    };
  }
}

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

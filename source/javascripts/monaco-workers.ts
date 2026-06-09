// Monaco Editor worker configuration for Vite
// Workers are served through Cloudflare proxy at /workflow_editor/* (same-origin)
// See: https://github.com/remcohaszing/monaco-yaml#vite

import BitriseYamlWorker from '@bitrise/languageserver/monaco/bitrise.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import YamlWorker from './yaml.worker?worker';

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker: (_moduleId: string, label: string) => Worker;
    };
  }
}

// A Worker script URL must be same-origin as the document. In dev WEBSITE mode with assets served
// directly from the WFE dev server (PUBLIC_URL_ROOT=http://localhost:PORT), Vite emits cross-origin
// worker URLs and `new Worker` throws. Load those from a same-origin blob that imports the real URL
// (Vite dev sends permissive CORS). No-op in production / proxied dev, where assets are same-origin.
const NativeWorker = globalThis.Worker;
class SameOriginWorker extends NativeWorker {
  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    const urlStr = typeof scriptURL === 'string' ? scriptURL : scriptURL.href;
    let isCrossOrigin = false;
    try {
      isCrossOrigin = new URL(urlStr, self.location.href).origin !== self.location.origin;
    } catch {
      isCrossOrigin = false;
    }

    if (isCrossOrigin) {
      const isModule = options?.type === 'module' || /[?&]type=module(&|$)/.test(urlStr);
      const body = isModule ? `import ${JSON.stringify(urlStr)};` : `importScripts(${JSON.stringify(urlStr)});`;
      const blobUrl = URL.createObjectURL(new Blob([body], { type: 'text/javascript' }));
      super(blobUrl, { ...options, type: isModule ? 'module' : 'classic' });
      return;
    }

    super(scriptURL, options);
  }
}
globalThis.Worker = SameOriginWorker;

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'bitrise-yaml') {
      return new BitriseYamlWorker();
    }
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

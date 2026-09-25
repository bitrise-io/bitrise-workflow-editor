function dataLayer() {
  return window.parent.dataLayer;
}

function instance() {
  return window.parent;
}

function location() {
  return instance().location;
}

/** Reloads the editor itself, which is the iframe in website mode, not the page around it. */
function reloadEditor() {
  window.location.reload();
}

function postMessageToParent<T = unknown>(type: string, payload?: T) {
  instance().postMessage({ type, payload }, window.location.origin);
}

function onMessageFromParent<T = unknown>(callback: (type: string, payload: T) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && typeof event.data.type === 'string') {
      callback(event.data.type, event.data.payload);
    }
  };

  window.addEventListener('message', handler);

  return () => {
    window.removeEventListener('message', handler);
  };
}

export default {
  dataLayer,
  instance,
  location,
  reloadEditor,
  postMessageToParent,
  onMessageFromParent,
};

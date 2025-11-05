export default {
  async fetch(request, env, ctx) {
    const urlObject = new URL(request.url);
    if (urlObject.pathname.match(/^\/workflow_editor\/.*$/)) {
      urlObject.hostname = 'workflow-editor-cdn.bitrise.io';
      return fetch(urlObject);
    }

    // Return 404 for non-matching requests
    return new Response('Not Found', { status: 404 });
  }
};
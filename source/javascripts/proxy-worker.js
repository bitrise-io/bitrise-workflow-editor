export default {
  async fetch(request, env, ctx) {
    const urlObject = new URL(request.url);

    const rssMatch = urlObject.pathname.match(/^\/workflow_editor\/(.*)$/);
    if (rssMatch) {
      urlObject.hostname = 'workflow-editor-cdn.bitrise.io';
      urlObject.pathname = `/workflow_editor/${rssMatch[1]}`;
      return await fetch(urlObject);
    }
  }
};
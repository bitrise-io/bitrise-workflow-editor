import { delay, http, HttpResponse } from 'msw';

import { ToolCatalogEntry } from '../models/Tools';

const DEFAULT_TOOLS: ToolCatalogEntry[] = [
  { name: 'golang', aliases: ['go'] },
  { name: 'nodejs', aliases: ['node'] },
  { name: 'ruby', aliases: [] },
  { name: 'python', aliases: [] },
  { name: 'flutter', aliases: [] },
];

const CATALOG_URL = 'https://bitrise.io/stacks/tools/v1/catalog.json';

function getToolCatalog() {
  return http.get(CATALOG_URL, async () => {
    await delay();
    return HttpResponse.json({ tools: DEFAULT_TOOLS, timestamp: new Date().toISOString() });
  });
}

function getToolCatalogPending() {
  return http.get(CATALOG_URL, async () => delay('infinite'));
}

function getToolCatalogError() {
  return http.get(CATALOG_URL, async () => {
    await delay();
    return HttpResponse.json(null, { status: 500 });
  });
}

export default { getToolCatalog, getToolCatalogPending, getToolCatalogError };

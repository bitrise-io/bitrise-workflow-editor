import { delay, http, HttpResponse } from 'msw';

import { ToolCatalogEntry } from '../models/Tools';

const DEFAULT_TOOLS: ToolCatalogEntry[] = [
  { name: 'golang', aliases: ['go'] },
  { name: 'nodejs', aliases: ['node'] },
  { name: 'ruby', aliases: [] },
  { name: 'python', aliases: [] },
  { name: 'flutter', aliases: [] },
];

const BASE_URL = 'https://bitrise.io/stacks/tools/v1';
const CATALOG_URL = `${BASE_URL}/catalog.json`;
// Also matches catalog.json — always register a catalog handler BEFORE a versions handler.
const TOOL_VERSIONS_URL = `${BASE_URL}/:toolFile`;

const DEFAULT_VERSIONS: Record<string, string[]> = {
  golang: ['1.25.7', '1.25.6', '1.24.2', '1.23.0'],
  nodejs: [
    // Long, unsorted list on purpose: exercises newest-first sorting and type-to-filter.
    ...['24.0.0', '24.1.0', '24.2.0', '22.4.1', '22.11.0', '22.12.0', '20.9.0', '20.10.0', '20.11.1', '18.20.4'],
    'lts-iron',
  ],
  ruby: ['3.4.2', '3.3.6', '3.2.6'],
  python: ['3.13.4', '3.12.8', '3.11.11'],
  // In the catalog, but no published versions yet.
  flutter: [],
};

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

function getToolVersions() {
  return http.get(TOOL_VERSIONS_URL, async ({ params }) => {
    const toolId = String(params.toolFile).replace(/\.json$/, '');
    await delay();
    return HttpResponse.json({ versions: DEFAULT_VERSIONS[toolId] ?? ['1.0.0'], timestamp: new Date().toISOString() });
  });
}

function getToolVersionsPending() {
  return http.get(TOOL_VERSIONS_URL, async () => delay('infinite'));
}

function getToolVersionsError() {
  return http.get(TOOL_VERSIONS_URL, async () => {
    await delay();
    return HttpResponse.json(null, { status: 500 });
  });
}

export default {
  getToolCatalog,
  getToolCatalogPending,
  getToolCatalogError,
  getToolVersions,
  getToolVersionsPending,
  getToolVersionsError,
};

import { delay, http, HttpResponse } from 'msw';

import { ToolCatalogEntry } from '../models/Tools';

const BASE_URL = 'https://bitrise.io/stacks/tools/v1';
const CATALOG_INDEX_URL = `${BASE_URL}/catalog.json`;
// Per-tool catalogs sit next to the index under the same base URL, so this pattern also
// matches catalog.json — toolIdFromFile below tells the two apart.
const TOOL_VERSIONS_URL = `${BASE_URL}/:file`;

const CATALOG: ToolCatalogEntry[] = [
  { name: 'golang', aliases: ['go'] },
  { name: 'nodejs', aliases: ['node'] },
  { name: 'ruby', aliases: [] },
  { name: 'python', aliases: [] },
  { name: 'flutter', aliases: [] },
  { name: 'java', aliases: [] },
  { name: 'elixir', aliases: [] },
];

// A tool is only listed in the catalog once it has at least one published version, so every
// entry here has a non-empty list — keep it that way when adding tools.
const VERSIONS: Record<string, string[]> = {
  golang: ['1.25.7', '1.25.6', '1.24.2', '1.23.0'],
  // Newest first, like the real catalog: a prefix resolves to the first entry that starts with it.
  nodejs: [
    ...['24.2.0', '24.1.0', '24.0.0', '22.12.0', '22.11.0', '22.4.1', '20.11.1', '20.10.0', '20.9.0', '18.20.4'],
    'lts-iron',
  ],
  ruby: ['3.4.2', '3.3.6', '3.2.6'],
  python: ['3.13.4', '3.12.8', '3.11.11'],
  flutter: ['3.35.1', '3.32.0', '3.29.3'],
  // Mostly not semver, like the real catalog: exercises string-derived prefixes.
  java: ['26.0.2', 'zulu-musl-8.96.0.19', 'zulu-musl-8.94.0.17', '18.0.1.1'],
  // No version numbers at all, so a prefix has to be typed.
  elixir: ['nightly', 'stable', 'edge'],
};

/**
 * The tool ID for a `TOOL_VERSIONS_URL` match, or undefined when the match is actually the
 * catalog index. Every versions handler checks this first and returns no response for the
 * index, which makes MSW fall through to whichever catalog handler is registered — so the two
 * sets of handlers can be combined in either order.
 */
function toolIdFromFile(file: unknown): string | undefined {
  const name = String(file);
  return name === 'catalog.json' ? undefined : name.replace(/\.json$/, '');
}

function getToolCatalog() {
  return http.get(CATALOG_INDEX_URL, async () => {
    await delay();
    return HttpResponse.json({ tools: CATALOG, timestamp: new Date().toISOString() });
  });
}

function getToolCatalogPending() {
  return http.get(CATALOG_INDEX_URL, async () => delay('infinite'));
}

function getToolCatalogError() {
  return http.get(CATALOG_INDEX_URL, async () => {
    await delay();
    return HttpResponse.json(null, { status: 500 });
  });
}

function getToolVersions() {
  return http.get(TOOL_VERSIONS_URL, async ({ params }) => {
    const toolId = toolIdFromFile(params.file);
    if (!toolId) {
      return undefined;
    }

    await delay();
    return HttpResponse.json({ versions: VERSIONS[toolId] ?? ['1.0.0'], timestamp: new Date().toISOString() });
  });
}

function getToolVersionsPending() {
  return http.get(TOOL_VERSIONS_URL, async ({ params }) =>
    toolIdFromFile(params.file) ? delay('infinite') : undefined,
  );
}

function getToolVersionsError() {
  return http.get(TOOL_VERSIONS_URL, async ({ params }) => {
    if (!toolIdFromFile(params.file)) {
      return undefined;
    }

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

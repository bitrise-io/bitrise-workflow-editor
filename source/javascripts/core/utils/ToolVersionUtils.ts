import { ToolVersions } from '../models/Tools';

/**
 * Where a prefix's line may end. After a number `+` opens build metadata, and after a name it
 * joins flavours, as in `truffleruby+graalvm`.
 */
const LINE_SEPARATORS = { numeric: '.-+', named: '.-' };

/** A prefix is numeric once a leading `v` or `V` is dropped, so `v1.12` is one. */
const NUMERIC_START = /^[vV]?\d/;

/** The line bare `latest` searches, which leaves out names such as `graalpython-22.2.0`. Only a lowercase `v`. */
const LATEST_LINE = /^v?\d/;

/** A prefix of `latest`, as in `latest:latest`, which the CLI and mise both read as bare `latest`. */
const LATEST_PREFIX = 'latest';

const NODE_LTS_LINES = {
  argon: '4',
  boron: '6',
  carbon: '8',
  dubnium: '10',
  erbium: '12',
  fermium: '14',
  gallium: '16',
  hydrogen: '18',
  iron: '20',
  jod: '22',
  krypton: '24',
};

/**
 * The aliases mise swaps in before it matches, transcribed from `get_aliases` in its node and java
 * plugins. Like `PRERELEASE_MARKER`, check them against the mise the CLI pins.
 */
const ALIASES: Record<string, Record<string, string>> = {
  nodejs: {
    lts: '24',
    ...Object.fromEntries(
      Object.entries(NODE_LTS_LINES).flatMap(([name, line]) => [
        [`lts-${name}`, line],
        [`lts/${name}`, line],
      ]),
    ),
  },
  java: { lts: '25' },
};

/** java replaces mise's matcher: `+` ends any line, and there are no `v` spellings. */
const JAVA_TOOL_ID = 'java';

/** The line java's bare `latest` searches, and where a prefix gains a `v` spelling. */
const DIGIT_START = /^\d/;

/** A part of nothing but digits, as the `8` in `zulu-musl-8.96.0.19`, where a version begins. */
const NUMERIC_PART = /^\d+$/;

/** A prefix that is nothing but numbers and dots, like `24` or `24.2`, so it can be ordered. */
const NUMERIC_PREFIX = /^\d+(\.\d+)*$/;

/**
 * mise's `VERSION_REGEX`, transcribed from `src/plugins/mod.rs` minus its `^Available versions:`
 * alternative, which guards plugin script output rather than naming a version. Do not hand write a
 * replacement. mise last changed it on 2026-07-22 (`cf4634be3`).
 */
const PRERELEASE_MARKER =
  /-src|[-.]dev|-latest|-stm|[-.]rc|-milestone|-alpha|-beta|[-.]pre|-next|-test|-nightly|-canary|-experimental|-insider|-edge|snapshot|master|\d(?:alpha|beta|rc)\d*\b/i;

/** What mise matches for a configured prefix, once aliases and a literal `latest` are read. */
function toQuery(prefix: string, toolId: string): string {
  const resolved = ALIASES[toolId]?.[prefix] ?? prefix;
  return resolved === LATEST_PREFIX ? '' : resolved;
}

/** The prefix, plus the spelling mise also tries with or without a leading `v`. */
function getSpellings(prefix: string): string[] {
  if (DIGIT_START.test(prefix)) {
    return [prefix, `v${prefix}`];
  }

  return /^[vV]/.test(prefix) ? [prefix, prefix.slice(1)] : [prefix];
}

function continuesLine(version: string, head: string, separators: string): boolean {
  // mise wants something after the separator, so `22.` is not in the `22` line.
  return (
    version === head ||
    (version.length > head.length + 1 && version.startsWith(head) && separators.includes(version[head.length]))
  );
}

/**
 * Whether `version` is in `prefix`'s line, mirroring mise's `fuzzy_match_versions`: `24.2` covers
 * `24.2.0`, not `24.20.0`. See `docs/decisions.md`.
 */
function matchesPrefix(version: string, prefix: string, toolId: string): boolean {
  const isJava = toolId === JAVA_TOOL_ID;

  if (prefix === '') {
    return (isJava ? DIGIT_START : LATEST_LINE).test(version);
  }

  const separators = isJava || NUMERIC_START.test(prefix) ? LINE_SEPARATORS.numeric : LINE_SEPARATORS.named;
  const heads = isJava ? [prefix] : getSpellings(prefix);

  // A vendor prefix such as `temurin-` runs straight into the version.
  return heads.some((head) =>
    prefix.endsWith('-') ? version.startsWith(head) : continuesLine(version, head, separators),
  );
}

/** Where `version` can be cut to name a line: the whole name, then at most major and minor. */
function toPrefixes(version: string, toolId: string): string[] {
  const cuts: string[] = [];
  // Anchored, or a name carrying digits of its own such as `miniconda3` would end the name early.
  let major = -1;
  let partStart = 0;

  for (let index = 0; index < version.length; index += 1) {
    if (!LINE_SEPARATORS.numeric.includes(version[index])) {
      continue;
    }

    if (major === -1 && NUMERIC_PART.test(version.slice(partStart, index))) {
      major = cuts.length;
    }

    const cut = version.slice(0, index);
    // Walks the widest separator set and keeps only the cuts mise can resolve.
    if (matchesPrefix(version, cut, toolId)) {
      cuts.push(cut);
    }

    partStart = index + 1;
  }

  if (cuts.length === 0) {
    return [version];
  }

  return major === -1 ? cuts : cuts.slice(0, major + 2);
}

/** Newest first, part by part so `24.11` beats `24.2`, and a prefix sorts above what it contains. */
function compareNumericPrefixes(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let index = 0; index < Math.max(aParts.length, bParts.length); index += 1) {
    if (aParts[index] === undefined) {
      return -1;
    }

    if (bParts[index] === undefined) {
      return 1;
    }

    if (aParts[index] !== bParts[index]) {
      return bParts[index] - aParts[index];
    }
  }

  return 0;
}

/**
 * Prefixes cut from each version, since catalogs are rarely semver. Newest first. Only the versions
 * mise keeps are cut, so a line of nothing but prereleases is not offered.
 */
function getPrefixes(toolVersions: ToolVersions | undefined): string[] {
  const prefixes: string[] = [];
  const seen = new Set<string>();

  (toolVersions?.versions ?? [])
    .filter(({ version }) => !PRERELEASE_MARKER.test(version))
    .forEach(({ version }) => {
      toPrefixes(version, toolVersions?.toolId ?? '').forEach((prefix) => {
        if (prefix && !seen.has(prefix)) {
          seen.add(prefix);
          prefixes.push(prefix);
        }
      });
    });

  return [
    ...prefixes.filter((prefix) => NUMERIC_PREFIX.test(prefix)).sort(compareNumericPrefixes),
    ...prefixes.filter((prefix) => !NUMERIC_PREFIX.test(prefix)),
  ];
}

/**
 * What `prefix` resolves to, mirroring mise's `find_match_in_list`: the first stable catalog
 * version in its line, assuming the catalog lists newest first. Undefined where mise finds nothing.
 * See `docs/decisions.md`.
 */
function getLatestVersion(toolVersions: ToolVersions | undefined, configuredPrefix = ''): string | undefined {
  const toolId = toolVersions?.toolId ?? '';
  const prefix = toQuery(configuredPrefix, toolId);
  const versions = toolVersions?.versions.map(({ version }) => version) ?? [];
  // java compares the regex escaped prefix, so its exact hit does not skip the prerelease filter.
  const isExactHit = versions.includes(prefix) && !(toolId === JAVA_TOOL_ID && PRERELEASE_MARKER.test(prefix));

  if (prefix && isExactHit) {
    return prefix;
  }

  const stable = versions.find((version) => matchesPrefix(version, prefix, toolId) && !PRERELEASE_MARKER.test(version));

  return stable ?? (prefix === '' ? versions[0] : undefined);
}

/** Whether the catalog has any version in `prefix`'s line. */
function isPrefixInCatalog(toolVersions: ToolVersions, prefix: string): boolean {
  return toolVersions.versions.some(({ version }) =>
    matchesPrefix(version, toQuery(prefix, toolVersions.toolId), toolVersions.toolId),
  );
}

export default {
  getPrefixes,
  getLatestVersion,
  isPrefixInCatalog,
};

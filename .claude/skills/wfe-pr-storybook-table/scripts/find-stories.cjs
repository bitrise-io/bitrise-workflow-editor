#!/usr/bin/env node
// Finds the nearest Storybook stories for changed files in bitrise-workflow-editor and prints
// their real story IDs plus PR-build / production URLs.
//
// Usage (from the repo root):
//   node .claude/skills/wfe-pr-storybook-table/scripts/find-stories.cjs [--pr <N>] [--base <ref>] [file ...]
// Without files, it uses `git diff --name-only <base>...HEAD` (base defaults to origin/master).

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let pr = "<N>";
let base = "origin/master";
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--pr") pr = args[++i];
  else if (args[i] === "--base") base = args[++i];
  else files.push(args[i]);
}

const repo = execSync("git rev-parse --show-toplevel", {
  encoding: "utf8",
}).trim();
const SRC = path.join(repo, "source");
const ALIAS = path.join(repo, "source/javascripts");
const STORY_GLOB = ["../source/**/*.stories.tsx"];
const MAX_DEPTH = 8;
const MAX_STORY_FILES = 6;

const changed = (
  files.length
    ? files
    : execSync(`git diff --name-only ${base}...HEAD`, {
        cwd: repo,
        encoding: "utf8",
      }).split("\n")
)
  .filter((f) => /^source\/.*\.(tsx?|jsx?)$/.test(f))
  .map((f) => path.join(repo, f));

// ---- import graph ----
const all = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) all.push(p);
  }
})(SRC);

const resolve = (from, spec) => {
  let p;
  if (spec.startsWith("@/")) p = path.join(ALIAS, spec.slice(2));
  else if (spec.startsWith(".")) p = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [
    p,
    `${p}.ts`,
    `${p}.tsx`,
    `${p}.js`,
    `${p}/index.ts`,
    `${p}/index.tsx`,
  ]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
};

const importers = new Map(); // file -> Set of files importing it
const IMPORT_RE = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
for (const f of all) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(IMPORT_RE)) {
    const target = resolve(f, m[1]);
    if (!target) continue;
    if (!importers.has(target)) importers.set(target, new Set());
    importers.get(target).add(f);
  }
}

const isStory = (f) => f.endsWith(".stories.tsx");
const rel = (f) => path.relative(repo, f);

// BFS upwards; stop each branch at the first story file it reaches.
const nearestStories = (start) => {
  if (isStory(start)) return [{ story: start, chain: [start] }];
  const found = [];
  const seen = new Set([start]);
  let frontier = [[start]];
  for (let d = 0; d < MAX_DEPTH && frontier.length && found.length === 0; d++) {
    const next = [];
    for (const chain of frontier) {
      for (const imp of importers.get(chain[chain.length - 1]) || []) {
        if (seen.has(imp)) continue;
        seen.add(imp);
        if (isStory(imp)) found.push({ story: imp, chain: [...chain, imp] });
        else next.push([...chain, imp]);
      }
    }
    frontier = next;
  }
  return found.slice(0, MAX_STORY_FILES);
};

// ---- story IDs via the CSF parser (never hand-rolled) ----
const req = require("module").createRequire(path.join(repo, "package.json"));
const { readCsf } = req("storybook/internal/csf-tools");
const { getStoryTitle } = req("storybook/internal/common");

const storyIds = async (abs) => {
  const csf = (
    await readCsf(abs, {
      makeTitle: (userTitle) =>
        getStoryTitle({
          storyFilePath: abs,
          configDir: path.join(repo, ".storybook"),
          workingDir: repo,
          stories: STORY_GLOB,
          userTitle,
        }),
    })
  ).parse();
  // csf.stories has no exportName; csf._stories is keyed by it.
  return Object.entries(csf._stories).map(([exportName, s]) => ({
    exportName,
    id: s.id,
    name: s.name,
  }));
};

const url = (env, id) =>
  `https://storybook.services.bitrise.dev/projects/wfe/${env}/?path=/story/${id}`;

(async () => {
  if (!changed.length) {
    console.log("No changed source files.");
    return;
  }
  for (const f of changed) {
    console.log(`\n## ${rel(f)}`);
    if (!fs.existsSync(f)) {
      console.log("  (deleted)");
      continue;
    }
    const hits = nearestStories(f);
    if (!hits.length) {
      console.log(
        `  NO STORY within ${MAX_DEPTH} import hops — say so in the PR description.`,
      );
      continue;
    }
    for (const { story, chain } of hits) {
      console.log(`  ${rel(story)}`);
      console.log(
        `    via: ${chain.map((c) => path.basename(c)).join(" <- ")}`,
      );
      try {
        for (const s of await storyIds(story)) {
          console.log(`    - ${s.exportName}  ${s.id}`);
          console.log(`        PR:   ${url(`pr-${pr}`, s.id)}`);
          console.log(`        prod: ${url("production", s.id)}`);
        }
      } catch (e) {
        console.log(`    ERROR parsing: ${e.message}`);
      }
    }
  }
})();

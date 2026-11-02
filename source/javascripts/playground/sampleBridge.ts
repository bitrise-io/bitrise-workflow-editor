import { WireTreeNode } from '@/core/api/BitriseYmlApi';

import samples from './sampleProjects.json';

// Prototype-only: the design playground's two sample projects, exported from the Monolith's mock database
// (app/javascript/prototypes/playground/db.ts), so this repo's own Storybook can show the whole editor without
// the Monolith around it. acme-superapp has a modular, repository-stored config; my-ios-app keeps a single
// bitrise.yml on bitrise.io.
type SampleProject = {
  title: string;
  editorFeatureFlags: Record<string, boolean>;
  bitriseYml: string;
  configTree: WireTreeNode | null;
  configSettings: { usesRepositoryYml: boolean; modularYamlSupported: boolean };
  branches: string[];
};

export const SAMPLE_PROJECTS = samples as unknown as Record<'acme-superapp' | 'my-ios-app', SampleProject>;

export type SampleProjectSlug = keyof typeof SAMPLE_PROJECTS;

const sample = (projectSlug: string): SampleProject | undefined => SAMPLE_PROJECTS[projectSlug as SampleProjectSlug];

// What the Monolith's playground puts on `window.playground` for startPlaygroundMocks to read.
export const sampleBridge = {
  bitriseYml: (projectSlug: string) => sample(projectSlug)?.bitriseYml,
  configTree: (projectSlug: string) => sample(projectSlug)?.configTree ?? undefined,
  configSettings: (projectSlug: string) => sample(projectSlug)?.configSettings,
  branches: (projectSlug: string) => sample(projectSlug)?.branches,
};

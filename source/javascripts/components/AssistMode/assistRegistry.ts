export type AssistId =
  | 'wfe.workflows'
  | 'wfe.secrets'
  | 'wfe.env-vars'
  | 'wfe.triggers'
  | 'wfe.stacks'
  | 'wfe.step'
  | 'wfe.workflow-selector';

export type AssistEntry = {
  title: string;
  body: string;
  docsLabel: string;
  docsUrl: string;
};

// Every entry is reviewed copy with a verified docs link — the same rule as the monolith's
// registry: no generated content renders without going through a PR like this file.
export const assistRegistry: Record<AssistId, AssistEntry> = {
  'wfe.workflows': {
    title: 'Workflows',
    body:
      'A workflow is a named sequence of steps — the recipe a build follows, like installing dependencies, ' +
      'testing or deploying. This is where you build and edit them; a project usually has several workflows ' +
      'for different purposes.',
    docsLabel: 'Workflows & Pipelines',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines',
  },
  'wfe.secrets': {
    title: 'Secrets',
    body:
      'Secrets store sensitive values like API keys and passwords as environment variables. Their values are ' +
      'encrypted, never written to your bitrise.yml, and can be hidden from build logs and pull request builds.',
    docsLabel: 'Secrets',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-ci/configure-builds/secrets',
  },
  'wfe.env-vars': {
    title: 'Environment Variables',
    body:
      'Env Vars hold non-sensitive configuration your steps can read, like a project path or a build variant. ' +
      'You can define them for the whole project or per workflow — anything confidential belongs in Secrets instead.',
    docsLabel: 'Environment variables',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-ci/configure-builds/environment-variables',
  },
  'wfe.triggers': {
    title: 'Triggers',
    body:
      'Triggers start builds automatically from git events: a push, a pull request or a new tag. Each trigger ' +
      'matches an event to the workflow or pipeline it should run, so the right checks run without anyone ' +
      'starting them by hand.',
    docsLabel: 'Triggering builds automatically',
    docsUrl:
      'https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html',
  },
  'wfe.stacks': {
    title: 'Stacks & Machines',
    body:
      'The stack is the operating system image your builds run on, and the machine type is the hardware behind ' +
      'it. Pick them per workflow — heavier workflows can run on larger machines for faster builds at a higher ' +
      'credit rate.',
    docsLabel: 'Build machine types',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-platform/infrastructure/build-machines/build-machine-types.html',
  },
  'wfe.step': {
    title: 'Step',
    body:
      'A step is one task in your workflow, like cloning your repository or running tests. Steps run top to ' +
      'bottom; click one to configure its inputs, or drag it to reorder the workflow.',
    docsLabel: 'Adding steps to a workflow',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines/steps/adding-steps-to-a-workflow',
  },
  'wfe.workflow-selector': {
    title: 'Workflow selector',
    body:
      'Switches which workflow you are editing on the canvas below. You can also create a new workflow from ' +
      'here — from scratch or based on an existing one.',
    docsLabel: 'Creating a workflow',
    docsUrl: 'https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines/workflows/creating-a-workflow',
  },
};

export const isAssistId = (value: string | null): value is AssistId => !!value && value in assistRegistry;

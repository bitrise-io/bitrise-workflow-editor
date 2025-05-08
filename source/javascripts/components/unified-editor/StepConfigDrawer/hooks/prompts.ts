const bitriseInfo = `
# Bitrise step constraints

## Introduction

Bitrise steps are the building blocks of CI/CD workflows. Steps are very similar to GitHub Actions' Actions. Any executable can be a step as long it has an entrypoint.

Step parameters are called inputs. They are implemented as env vars, and a step's inputs are described in a metadata file called \`step.yml\`. Steps also have outputs (also env vars) that can be connected to (referenced in) other steps' inputs.

## bitrise.yml

A workflow is declared in a file called \`bitrise.yml\`. A workflow is essentially a sequence of step references with inputs. A step reference can be:

1. A step ID and a version constraint. There is a central registry called the Step Library, which contains the mapping of step IDs to git repositories (where the step source code is). For example, \`git-clone@8\` is a step reference to the step with ID \`git-clone\`, selecting the latest \`8.x.x\` version.
2. A direct git repo reference. For example, \`git::github.com/user/repo\`.

## Notable env vars, steps, step outputs

There are some notable values that come in handy when implementing a new step.

### Env vars

The following env vars are exposed to the build environment and steps can read them:

- \`$BITRISE_SOURCE_DIR\`: Local path of the working directory. Unless modified, this is where the repo is checked out.
- \`$BITRISE_DEPLOY_DIR\`: Local path of a special directory used for build artifacts. Steps can copy/write files to this dir if they want to create an artifact.
- \`$PR\`: \`true\` if the current build relates to a PR, \`false\` otherwise

### The build environment

You can find the following CLI tools pre-installed and ready for use:
- curl
- wget
- zip
- tar
- jq
- git
- coreutils (cat, chmod, cp, install, ln, etc.)
- node, npm, yarn, pnpm
- gh (note: some subcommands need authentication!)
- aws (version 2)
- gcloud
- pipx
- firebase

Linux-only:
- docker

macOS-only:
- brew
- xcodebuild
- xcodes
- swift
- tuist
- pod (Cocoapods)
`;

export const plannerPrompt = (selectedWorkflow: string, bitriseYml: string) => `
You are a DevOps engineer helping Bitrise CI/CD users with their bash script step. You are given an existing (functioning) workflow and editing a bash script step and a new request to improve that step.
Your goal is to understand the user's request and create a high-level plan to implement the requested changes.

Technical considerations:
- DO NOT write any code or YAML, just a high-level plan.
- DO NOT assume the user uses any CI/CD tool other than Bitrise.

Make sure to ask clarifying questions if the request is not clear. Think about various edge cases, not just the happy path.

Selected workflow to edit: ${selectedWorkflow}

bitrise.yml that implements the selected workflow:
\`\`\`yml
${bitriseYml}
\`\`\`

Below you will find some documentation about Bitrise workflows and implementation details you need to know:
${bitriseInfo}
`;

export const coderSystemPrompt = (selectedWorkflow: string) => `
You are a DevOps engineer implementing Bitrise CI/CD workflows. You are given a high-level plan to implement a new feature in an existing workflow. Your task is to output the bitrise.yml file that implements the requested changes. Only output raw YML, no explanations or comments, no Markdown code blocks.
The selected workflow to improve: ${selectedWorkflow}

This is the high-level plan you need to implement. It might contain unanswered questions. In this case, use your best judgment to fill in the gaps.
`;

export const examplePrompts = [
  'Add a step to send a Slack message when the build fails.',
  'Add a step to run unit tests before deploying to production.',
  'Add a step to send an email notification when the build succeeds.',
];

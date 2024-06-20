import { Step } from './StepDrawer.types';

export const MockSteps: Step[] = [
  {
    id: 'activate-ssh-key',
    title: 'Activate SSH key',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/activate-ssh-key/assets/icon.svg',
    version: '1.1.6',
    description:
      'Add your SSH key to the build machine to access private repositories\n' +
      '\n' +
      'This Step makes sure Bitrise has access to your repository when cloning SSH URLs. The Step saves the provided private key of your SSH keypair to a file and then loads it into the SSH agent.',
    categories: ['access-control'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'clone',
    title: 'Git Clone',
    description:
      'Checks out the repository, updates submodules and exports git metadata as Step outputs.\n' +
      '\n' +
      'The checkout process depends on the Step settings and the build trigger parameters (coming from your git server).',
    version: '8.3.1',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/git-clone/assets/icon.svg',
    categories: ['utility'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'npm',
    title: 'Run npm command',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/npm/assets/icon.svg',
    version: '1.1.6',
    description:
      "The Step runs npm with the command and arguments you provide, for example, to install missing packages or run a package's test.",
    categories: ['build', 'test', 'utility'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'test',
    title: 'Xcode Test for iOS',
    description: "Runs your project's pre-defined Xcode tests on every build.",
    version: '5.1.1',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-test/assets/icon.svg',
    categories: ['test'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'xcode-archive',
    title: 'Xcode Archive & Export for iOS',
    description:
      'Archive and export an Xcode project.\n' +
      '\n' +
      'This Step will archive your Xcode project and export it as an .ipa file. You can also export the archive as a .xcarchive file.',
    version: '5.1.2',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-archive/assets/icon.svg',
    categories: ['test', 'build', 'deploy'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'codecov',
    title: 'Codecov',
    description:
      'Upload your code coverage files to Codecov.io\n' +
      '\n' +
      'Reduce technical debt with visualized test performance, faster code reviews and workflow enhancements. Now you can upload your code coverage files to Codecov every time you kick off a build!',
    version: '3.3.3',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/codecov/assets/icon.svg',
    categories: ['test'],
    isOfficial: false,
    isVerified: true,
    isDeprecated: false,
  },
  {
    id: 'deploy-to-bitrise-io',
    title: 'Deploy to Bitrise.io',
    description:
      "Deploys build artifacts to make them available for the user on the build's Artifacts tab.\n" +
      "Sends test results to the Test Reports add-on (build's Tests tab). Uploads Pipeline intermediate files to make them available in subsequent Stages and also uploads Bitrise and user generated html reports.",
    version: '2.8.1',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/deploy-to-bitrise-io/assets/icon.svg',
    categories: ['test', 'deploy'],
    isOfficial: true,
    isVerified: false,
    isDeprecated: false,
  },
  {
    id: 'azure-devops-status',
    title: 'Azure DevOps Status',
    description:
      'Update commit status for Azure DevOps repositories. This step always runs, no matter if build succeeded or failed.',
    version: '1.0.1',
    icon: 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/azure-devops-status/assets/icon.svg',
    categories: ['test'],
    isOfficial: false,
    isVerified: false,
    isDeprecated: true,
  },
];

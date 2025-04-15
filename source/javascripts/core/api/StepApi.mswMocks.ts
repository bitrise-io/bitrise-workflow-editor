import { delay, http, HttpResponse } from 'msw';

import { Maintainer } from '@/core/models/Step';

import { AlgoliaStepResponse } from './AlgoliaApi';

export const AlgoliaSteps: AlgoliaStepResponse[] = [
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/activate-ssh-key/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '4.1.1',
    cvs: 'activate-ssh-key@4.1.1',
    id: 'activate-ssh-key',
    version: '4.1.1',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Activate SSH key (RSA private key)',
      summary: 'Add your SSH key to the build machine to access private repositories',
      description:
        "This Step makes sure Bitrise has access to your repository when cloning SSH URLs. The Step saves the provided private key of your SSH keypair to a file and then loads it into the SSH agent.\n\n### Configuring the Step\n\nBy default, you do not have to change anything about the Step's configuration.\n\nThe step downloads the SSH key defined in your App Settings, so most of the time it's the only thing you need to configure ([more info](https://devcenter.bitrise.io/en/connectivity/configuring-ssh-keys).\n\n All you need to do is make sure that you registered your key pair on Bitrise and the public key at your Git provider. You can generate and register an SSH keypair in two ways.\n\n- Automatically during the [app creation process](https://devcenter.bitrise.io/getting-started/adding-a-new-app/#setting-up-ssh-keys).\n- Manually during the app creation process or at any other time. You [generate your own SSH keys](https://devcenter.bitrise.io/faq/how-to-generate-ssh-keypair/) and register them on Bitrise and at your Git provider. The SSH key should not have a passphrase!\n\nNote: if you configure to use HTTPS instead of SSH git access, you don't need to use this Step.\n\n### Troubleshooting\n\nIf the Step fails, check the public key registered to your Git repository and compare it to the public key registered on Bitrise. The most frequent issue is that someone deleted or revoked the key on your Git provider's website.\n\nYou can also set the **Enable verbose logging** input to `true`. This provides additional information in the log.\n\n### Useful links\n\n- [Setting up SSH keys](https://devcenter.bitrise.io/getting-started/adding-a-new-app/#setting-up-ssh-keys)\n- [How can I generate an SSH key pair?](https://devcenter.bitrise.io/faq/how-to-generate-ssh-keypair/)\n\n### Related Steps\n\n- [Git Clone Repository](https://www.bitrise.io/integrations/steps/git-clone)",
      website: 'https://github.com/bitrise-steplib/steps-activate-ssh-key',
      source_code_url: 'https://github.com/bitrise-steplib/steps-activate-ssh-key',
      support_url: 'https://github.com/bitrise-steplib/steps-activate-ssh-key/issues',
      published_at: '2024-02-15T10:28:29.203495657Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-activate-ssh-key.git',
        commit: '78dae4ddaa4a2c3eddb35a3fc620b5fdf29fc82c',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/activate-ssh-key/assets/icon.svg',
      },
      type_tags: ['access-control'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-activate-ssh-key',
        },
      },
      deps: {
        apt_get: [
          {
            name: 'expect',
          },
          {
            name: 'git',
          },
        ],
      },
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: false,
      run_if: '.IsCI',
      timeout: 0,
      outputs: [
        {
          SSH_AUTH_SOCK: null,
          opts: {
            category: '',
            description:
              'If the `is_should_start_new_agent` option is enabled, and no accessible ssh-agent is found, the step will start a new ssh-agent.\n\nThis output contains the path of the socket created by ssh-agent, which can be used to access the started ssh-agent ([learn more](https://www.man7.org/linux/man-pages/man1/ssh-agent.1.html))',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'SSH agent socket path',
            unset: false,
          },
        },
      ],
    },
    objectID: '41256190000',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/git-clone/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '8.2.2',
    cvs: 'git-clone@8.2.2',
    id: 'git-clone',
    version: '8.2.2',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Git Clone Repository',
      summary: 'Checks out the repository, updates submodules and exports git metadata as Step outputs.',
      description:
        'The checkout process depends on the Step settings and the build trigger parameters (coming from your git server).\n\nDepending on the conditions, the step can checkout:\n- the merged state of a Pull Request\n- the head of a Pull Request\n- a git tag\n- a specific commit on a branch\n- the head of a branch\n\nThe Step also supports more advanced features, such as updating submodules and sparse checkouts.\n\n### Configuring the Step\n\nThe step should work with its default configuration if build triggers and webhooks are set up correctly.\n\nBy default, the Step performs a shallow clone in most cases (fetching only the latest commit) to make the clone fast and efficient. If your workflow requires a deeper commit history, you can override this using the **Clone depth** input.\n\n### Useful links\n\n- [How to register a GitHub Enterprise repository](https://discuss.bitrise.io/t/how-to-register-a-github-enterprise-repository/218)\n- [Code security](https://devcenter.bitrise.io/getting-started/code-security/)\n\n### Related Steps\n\n- [Activate SSH key (RSA private key)](https://www.bitrise.io/integrations/steps/activate-ssh-key)\n- [Generate changelog](https://bitrise.io/integrations/steps/generate-changelog)\n',
      website: 'https://github.com/bitrise-steplib/steps-git-clone',
      source_code_url: 'https://github.com/bitrise-steplib/steps-git-clone',
      support_url: 'https://github.com/bitrise-steplib/steps-git-clone/issues',
      published_at: '2024-06-03T06:38:20.120933072Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-git-clone.git',
        commit: 'bed9fb1a27d3904197977a90c643f234deedad29',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/git-clone/assets/icon.svg',
      },
      type_tags: ['utility'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-git-clone',
        },
      },
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: false,
      run_if: '.IsCI',
      timeout: 0,
      outputs: [
        {
          GIT_CLONE_COMMIT_HASH: null,
          opts: {
            category: '',
            description: 'SHA hash of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit hash',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_MESSAGE_SUBJECT: null,
          opts: {
            category: '',
            description: 'Commit message of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit message subject',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_MESSAGE_BODY: null,
          opts: {
            category: '',
            description: 'Commit message body of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit message body',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_COUNT: null,
          opts: {
            category: '',
            description:
              'Commit count after checkout.\n\nCount will only work properly if no `--depth` option is set. If `--depth` is set then the history truncated to the specified number of commits. Count will **not** fail but will be the clone depth.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit count',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_AUTHOR_NAME: null,
          opts: {
            category: '',
            description: 'Author of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit author name',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_AUTHOR_EMAIL: null,
          opts: {
            category: '',
            description: 'Email of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Commit author email',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_COMMITTER_NAME: null,
          opts: {
            category: '',
            description: 'Committer name of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Committer name',
            unset: false,
          },
        },
        {
          GIT_CLONE_COMMIT_COMMITTER_EMAIL: null,
          opts: {
            category: '',
            description: 'Email of the checked-out commit.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Committer email',
            unset: false,
          },
        },
      ],
    },
    objectID: '11414446002',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/npm/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '1.1.6',
    cvs: 'npm@1.1.6',
    id: 'npm',
    version: '1.1.6',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Run npm command',
      summary:
        "The Step runs npm with the command and arguments you provide, for example, to install missing packages or run a package's test.",
      description:
        "You can install missing JS dependencies with this Step if you insert it before any build step and provide the `install` command.\nYou can also test certain packages with the `test` command.\nYou can do both in one Workflow, however, this requires one **Run npm command** Step for installation followed by another **Run npm command** Step for testing purposes.\n\n### Configuring the Step\n1. Add the **Run npm command** Step to your Workflow preceding any build Step.\n2. Set the **Working directory**.\n3. Set the command you want npm to execute, for example `install` to run `npm install` in the **The npm command with arguments to run** input.\n4. If you're looking for a particular npm version, you can set it in the **Version of npm to use** input.\n5. You can cache the content of the node modules directory if you select `true` in the drop-down.\nBy default this input is set to false.\n\n### Troubleshooting\nMake sure you insert the Step before any build Step so that every dependency is downloaded a build Step starts running.\n\n### Useful links\n- [Getting started Ionic/Cordova apps](https://devcenter.bitrise.io/getting-started/getting-started-with-ionic-cordova-apps/)\n- [About npm](https://www.npmjs.com/)",
      website: 'https://github.com/bitrise-steplib/steps-npm',
      source_code_url: 'https://github.com/bitrise-steplib/steps-npm',
      support_url: 'https://github.com/bitrise-steplib/steps-npm/issues',
      published_at: '2022-07-15T09:23:38.232730219Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-npm.git',
        commit: '15f3332c80aa12f4c83b37bd0cbe71a2bbf0a9ff',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/npm/assets/icon.svg',
      },
      host_os_tags: ['osx-10.10'],
      type_tags: ['utility'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-npm',
        },
      },
      deps: {
        apt_get: [
          {
            name: 'nodejs',
          },
        ],
      },
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: false,
      run_if: '',
      timeout: 0,
    },
    objectID: '33867475001',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-test/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '5.1.1',
    cvs: 'xcode-test@5.1.1',
    id: 'xcode-test',
    version: '5.1.1',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Xcode Test for iOS',
      summary: "Runs your project's pre-defined Xcode tests on every build.",
      description:
        "This Steps runs all those Xcode tests that are included in your project.\nThe Step will work out of the box if your project has test targets and your Workflow has the **Deploy to Bitrise.io** Step which exports the test results and (code coverage files if needed) to the Test Reports page.\nThis Step does not need any code signing files since the Step deploys only the test results to [bitrise.io](https://www.bitrise.io).\n\n### Configuring the Step\nIf you click into the Step, there are some required input fields whose input must be set in accordance with the Xcode configuration of the project.\nThe **Scheme** input field must be marked as Shared in Xcode.\n\n### Troubleshooting\nIf the **Deploy to Bitrise.io** Step is missing from your Workflow, then the **Xcode Test for iOS** Step will not be able to export the test results on the Test Reports page and you won't be able to view them either.\nThe xcpretty output tool does not support parallel tests.\nIf parallel tests are enabled in your project, go to the Step's **xcodebuild log formatting** section and set the **Log formatter** input's value to `xcodebuild` or `xcbeautify`.\nIf the Xcode test fails with the error `Unable to find a destination matching the provided destination specifier`, then check our [system reports](https://stacks.bitrise.io) to see if the requested simulator is on the stack or not.\nIf it is not, then pick a simulator that is on the stack.\n\n### Useful links\n- [About Test Reports](https://devcenter.bitrise.io/testing/test-reports/)\n- [Running Xcode Tests for iOS](https://devcenter.bitrise.io/testing/running-xcode-tests/)\n\n### Related Steps\n- [Deploy to Bitrise.io](https://www.bitrise.io/integrations/steps/deploy-to-bitrise-io)\n- [iOS Device Testing](https://www.bitrise.io/integrations/steps/virtual-device-testing-for-ios)",
      website: 'https://github.com/bitrise-steplib/steps-xcode-test',
      source_code_url: 'https://github.com/bitrise-steplib/steps-xcode-test',
      support_url: 'https://github.com/bitrise-steplib/steps-xcode-test/issues',
      published_at: '2024-04-08T11:03:54.789032239Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-xcode-test.git',
        commit: '497f1110471c51c363331fd306a205e8a56bff64',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-test/assets/icon.svg',
      },
      project_type_tags: ['ios', 'cordova', 'ionic', 'react-native', 'flutter'],
      type_tags: ['test'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-xcode-test',
        },
      },
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: false,
      run_if: '',
      timeout: 0,
      outputs: [
        {
          BITRISE_XCODE_TEST_RESULT: null,
          opts: {
            category: '',
            description: "Result of the tests. 'succeeded' or 'failed'.",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Test result',
            unset: false,
            value_options: ['succeeded', 'failed'],
          },
        },
        {
          BITRISE_XCRESULT_PATH: null,
          opts: {
            category: '',
            description: 'The path of the generated `.xcresult`.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'The path of the generated `.xcresult`',
            unset: false,
          },
        },
        {
          BITRISE_XCRESULT_ZIP_PATH: null,
          opts: {
            category: '',
            description: 'The path of the zipped `.xcresult`.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'The path of the zipped `.xcresult`',
            unset: false,
          },
        },
        {
          BITRISE_XCODE_TEST_ATTACHMENTS_PATH: null,
          opts: {
            category: '',
            description: 'This is the path of the test attachments zip.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'The full, test attachments zip path',
            unset: false,
          },
        },
        {
          BITRISE_XCODEBUILD_BUILD_LOG_PATH: null,
          opts: {
            category: '',
            description:
              'If `single_build` is set to false, the step runs `xcodebuild build` before the test,\nand exports the raw xcodebuild log.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'xcodebuild build command log file path',
            unset: false,
          },
        },
        {
          BITRISE_XCODEBUILD_TEST_LOG_PATH: null,
          opts: {
            category: '',
            description: 'The step exports the `xcodebuild test` command output log.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'xcodebuild test command log file path',
            unset: false,
          },
        },
      ],
    },
    objectID: '44270676001',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-archive/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '5.1.1',
    cvs: 'xcode-archive@5.1.1',
    id: 'xcode-archive',
    version: '5.1.1',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Xcode Archive & Export for iOS',
      summary: 'Automatically manages your code signing assets, archives and exports an .ipa in one Step.',
      description:
        "The Step archives your Xcode project by running the `xcodebuild archive` command and then exports the archive into an .ipa file with the `xcodebuild -exportArchive` command.\nThis .ipa file can be shared, installed on test devices, or uploaded to the App Store Connect.\nWith this Step, you can use automatic code signing in a [CI environment without having to use Xcode](https://developer.apple.com/documentation/xcode-release-notes/xcode-13-release-notes).\nIn short, the Step:\n- Logs you into your Apple Developer account based on the [Apple service connection you provide on Bitrise](https://devcenter.bitrise.io/en/accounts/connecting-to-services/apple-services-connection.html).\n- Downloads any provisioning profiles needed for your project based on the **Distribution method**.\n- Runs your build. It archives your Xcode project by running the `xcodebuild archive` command and exports the archive into an .ipa file with the `xcodebuild -exportArchive` command.\nThis .ipa file can be shared and installed on test devices, or uploaded to App Store Connect.\n\n### Configuring the Step\nBefore you start:\n- Make sure you have connected your [Apple Service account to Bitrise](https://devcenter.bitrise.io/en/accounts/connecting-to-services/apple-services-connection.html).\nAlternatively, you can upload certificates and profiles to Bitrise manually, then use the Certificate and Profile installer step before Xcode Archive\n- Make sure certificates are uploaded to Bitrise's **Code Signing** tab. The right provisioning profiles are automatically downloaded from Apple as part of the automatic code signing process.\n\nTo configure the Step:\n1. **Project path**: Add the path where the Xcode Project or Workspace is located.\n2. **Scheme**: Add the scheme name you wish to archive your project later.\n3. **Distribution method**: Select the method Xcode should sign your project: development, app-store, ad-hoc, or enterprise.\n\nUnder **xcodebuild configuration**:\n1. **Build configuration**: Specify Xcode Build Configuration. The Step uses the provided Build Configuration's Build Settings to understand your project's code signing configuration. If not provided, the Archive action's default Build Configuration will be used.\n2. **Build settings (xcconfig)**: Build settings to override the project's build settings. Can be the contents, file path or empty.\n3. **Perform clean action**: If this input is set, a `clean` xcodebuild action will be performed besides the `archive` action.\n\nUnder **Xcode build log formatting**:\n1. **Log formatter**: Defines how `xcodebuild` command's log is formatted. Available options are `xcpretty`: The xcodebuild command's output will be prettified by xcpretty. `xcodebuild`: Only the last 20 lines of raw xcodebuild output will be visible in the build log.\nThe raw xcodebuild log is exported in both cases.\n\nUnder **Automatic code signing**:\n1. **Automatic code signing method**: Select the Apple service connection you want to use for code signing. Available options: `off` if you don't do automatic code signing, `api-key` [if you use API key authorization](https://devcenter.bitrise.io/en/accounts/connecting-to-services/connecting-to-an-apple-service-with-api-key.html), and `apple-id` [if you use Apple ID authorization](https://devcenter.bitrise.io/en/accounts/connecting-to-services/connecting-to-an-apple-service-with-apple-id.html).\n2. **Register test devices on the Apple Developer Portal**: If this input is set, the Step will register the known test devices on Bitrise from team members with the Apple Developer Portal. Note that setting this to `yes` may cause devices to be registered against your limited quantity of test devices in the Apple Developer Portal, which can only be removed once annually during your renewal window.\n3. **The minimum days the Provisioning Profile should be valid**: If this input is set to >0, the managed Provisioning Profile will be renewed if it expires within the configured number of days. Otherwise the Step renews the managed Provisioning Profile if it is expired.\n4. The **Code signing certificate URL**, the **Code signing certificate passphrase**, the **Keychain path**, and the **Keychain password** inputs are automatically populated if certificates are uploaded to Bitrise's **Code Signing** tab. If you store your files in a private repo, you can manually edit these fields.\n\nIf you want to set the Apple service connection credentials on the step-level (instead of using the one configured in the App Settings), use the Step inputs in the **App Store Connect connection override** category. Note that this only works if **Automatic code signing method** is set to `api-key`.\n\nUnder **IPA export configuration**:\n1. **Developer Portal team**: Add the Developer Portal team's name to use for this export. This input defaults to the team used to build the archive.\n2. **Rebuild from bitcode**: For non-App Store exports, should Xcode re-compile the app from bitcode?\n3. **Include bitcode**: For App Store exports, should the package include bitcode?\n4. **iCloud container environment**: If the app is using CloudKit, this input configures the `com.apple.developer.icloud-container-environment` entitlement. Available options vary depending on the type of provisioning profile used, but may include: `Development` and `Production`.\n5. **Export options plist content**: Specifies a `plist` file content that configures archive exporting. If not specified, the Step will auto-generate it.\n\nUnder **Step Output Export configuration**:\n1. **Output directory path**: This directory will contain the generated artifacts.\n2. **Export all dSYMs**: Export additional dSYM files besides the app dSYM file for Frameworks.\n3. **Override generated artifact names**:  This name is used as basename for the generated Xcode archive, app, `.ipa` and dSYM files. If not specified, the Product Name (`PRODUCT_NAME`) Build settings value will be used. If Product Name is not specified, the Scheme will be used.\n\nUnder **Caching**:\n1. **Enable collecting cache content**: Defines what cache content should be automatically collected. Available options are `none`: Disable collecting cache content and `swift_packages`: Collect Swift PM packages added to the Xcode project\n\nUnder Debugging:\n1. **Verbose logging***: You can set this input to `yes` to produce more informative logs.",
      website: 'https://github.com/bitrise-steplib/steps-xcode-archive',
      source_code_url: 'https://github.com/bitrise-steplib/steps-xcode-archive',
      support_url: 'https://github.com/bitrise-steplib/steps-xcode-archive/issues',
      published_at: '2024-02-27T13:42:22.968743737Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-xcode-archive.git',
        commit: 'f7d8619ec543651ff9bd65eafcc69452f4158ea2',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/xcode-archive/assets/icon.svg',
      },
      project_type_tags: ['ios', 'react-native', 'flutter'],
      type_tags: ['build'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-xcode-archive',
        },
      },
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: false,
      run_if: '',
      timeout: 0,
      outputs: [
        {
          BITRISE_IPA_PATH: null,
          opts: {
            category: '',
            description: '',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: 'Local path of the created .ipa file',
            title: '.ipa file path',
            unset: false,
          },
        },
        {
          BITRISE_APP_DIR_PATH: null,
          opts: {
            category: '',
            description: '',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: 'Local path of the generated `.app` directory',
            title: '.app directory path',
            unset: false,
          },
        },
        {
          BITRISE_DSYM_DIR_PATH: null,
          opts: {
            category: '',
            description:
              'This Environment Variable points to the path of the directory which contains the dSYMs files.\nIf `export_all_dsyms` is set to `yes`, the Step will collect every dSYM (app dSYMs and framwork dSYMs).',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: "The created .dSYM dir's path",
            unset: false,
          },
        },
        {
          BITRISE_DSYM_PATH: null,
          opts: {
            category: '',
            description:
              'This Environment Variable points to the path of the zip file which contains the dSYM files.\nIf `export_all_dsyms` is set to `yes`, the Step will also collect framework dSYMs in addition to app dSYMs.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: "The created .dSYM.zip file's path",
            unset: false,
          },
        },
        {
          BITRISE_XCARCHIVE_PATH: null,
          opts: {
            category: '',
            description: '',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: "The created .xcarchive file's path",
            title: '.xcarchive file path',
            unset: false,
          },
        },
        {
          BITRISE_XCARCHIVE_ZIP_PATH: null,
          opts: {
            category: '',
            description: '',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: "The created .xcarchive.zip file's path.",
            title: '.xcarchive.zip path',
            unset: false,
          },
        },
        {
          BITRISE_XCODEBUILD_ARCHIVE_LOG_PATH: null,
          opts: {
            category: '',
            description:
              'The file path of the raw `xcodebuild archive` command log. The log is placed into the `Output directory path`.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: '`xcodebuild archive` command log file path',
            unset: false,
          },
        },
        {
          BITRISE_XCODEBUILD_EXPORT_ARCHIVE_LOG_PATH: null,
          opts: {
            category: '',
            description:
              'The file path of the raw `xcodebuild -exportArchive` command log. The log is placed into the `Output directory path`.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: '`xcodebuild -exportArchive` command log file path',
            unset: false,
          },
        },
        {
          BITRISE_IDEDISTRIBUTION_LOGS_PATH: null,
          opts: {
            category: '',
            description: 'Exported when `xcodebuild -exportArchive` command fails.',
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Path to the xcdistributionlogs',
            unset: false,
          },
        },
      ],
    },
    objectID: '41605250000',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/codecov/assets/icon.svg',
      },
      maintainer: Maintainer.Verified,
    },
    latest_version_number: '3.3.3',
    cvs: 'codecov@3.3.3',
    id: 'codecov',
    version: '3.3.3',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Codecov',
      summary: 'Upload your code coverage files to Codecov.io',
      description:
        'Reduce technical debt with visualized test performance,\nfaster code reviews and workflow enhancements.\nNow you can upload your code coverage files to Codecov every time you kick off a build!',
      website: 'https://codecov.io',
      source_code_url: 'https://github.com/codecov/codecov-bitrise',
      support_url: 'https://community.codecov.io',
      published_at: '2023-09-15T09:34:57.29313-07:00',
      source: {
        git: 'https://github.com/codecov/codecov-bitrise.git',
        commit: 'e8d493c4251ae0d9032d54f17b97ff9351982bf3',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/codecov/assets/icon.svg',
      },
      type_tags: ['test'],
      is_requires_admin_user: false,
      is_always_run: false,
      is_skippable: true,
      run_if: '',
      timeout: 0,
    },
    objectID: '34299171000',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/deploy-to-bitrise-io/assets/icon.svg',
      },
      maintainer: Maintainer.Bitrise,
    },
    latest_version_number: '2.8.1',
    cvs: 'deploy-to-bitrise-io@2.8.1',
    id: 'deploy-to-bitrise-io',
    version: '2.8.1',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Deploy to Bitrise.io - Build Artifacts, Test Reports, and Pipeline intermediate files',
      summary:
        "Deploys build artifacts to make them available for the user on the build's **Artifacts** tab.  \nSends test results to the Test Reports add-on (build's **Tests** tab).\nUploads Pipeline intermediate files to make them available in subsequent Stages and also uploads Bitrise and user generated html reports.",
      description:
        "The Step accesses artifacts from a directory specified as the `$BITRISE_DEPLOY_DIR` where artifacts generated by previous Steps gets stored. \nThese artifacts are then uploaded on the **Artifacts** tab of any given build. For installable artifacts, such as IPAs or APKs, the Step can create a public install page that allows testers to install the app on their devices. \nYou can also use the Step to notify users about the build. If you wish to use the Test Reports add-on, you must add this Step in your Workflow since the Step converts test results to the right format and sends them to the add-on.\nThe Step can also share Pipeline intermediate files. These files are build artifacts generated by Workflows in a Pipeline intended to be shared with subsequent Stages.\nAlso it collects and uploads all of the html reports located in the `BITRISE_HTML_REPORT_DIR` folder.\n\n### Configuring the Build Artifact Deployment section of the Step\n\n1. Set the value for the **Deploy directory or file path** required input. The default value is the `$BITRISE_DEPLOY_DIR` Env Var which is exposed by the Bitrise CLI.\nIf you provide a directory, everything in that directory, excluding sub-directories, gets uploaded. \nIf you provide only a file, then only that file gets uploaded. \nTo upload a directory's content recursively, you should use the **Compress the artifacts into one file?** which will compress the whole directory, with every sub-directory included.\n2. Set the value of the **Notify: User Roles** input. It sends an email with the [public install URL](https://devcenter.bitrise.io/deploy/bitrise-app-deployment/) to those Bitrise users whose roles are included in this field. \nThe default value is `everyone`. If you wish to notify based on user roles, add one or more roles and separate them with commas, for example, `developers`, `admins`. If you don't want to notify anyone, set the input to `none`.\n3. Set the **Notify: Emails** sensitive input. It sends the public install URL in an email to the email addresses provided here. If you’re adding multiple email address, make sure to separate them with commas. \nThe recipients do not have to be in your Bitrise team. Please note that if the email address is associated with a Bitrise account, the user must be [watching](https://devcenter.bitrise.io/builds/configuring-notifications/#watching-an-app) the app.\n4. The **Enable public page for the App?** required input is set to `true` by default. It creates a long and random URL which can be shared with those who do not have a Bitrise account. \nIf you set this input to `false`, the **Notify: Emails** input will be ignored and the **Notify: User Roles** will receive the build URL instead of the public install URL.\n5. With the **Compress the artifacts into one file?** required input set to `true`, you can compress the artifacts found in the Deploy directory into a single file.\nYou can specify a custom name for the zip file with the `zip_name` option. If you don't specify one, the default `Deploy directory` name will be used. \nIf the **Compress the artifacts into one file?** is set to `false`, the artifacts in the Deploy directory will be deployed separately.\n6. With the **Format for the BITRISE_PUBLIC_INSTALL_PAGE_URL_MAP output** required input field, you can customize the output format of the public install page’s multiple artifact URLs so that the next Step can render the output (for example, our **Send a Slack message** Step). \nProvide a language template description using [https://golang.org/pkg/text/template](https://golang.org/pkg/text/template) so that the **Deploy to Bitrise.io** Step can build the required custom output.\n7. With the **Format for the BITRISE_PERMANENT_DOWNLOAD_URL_MAP output** required input, you can customize the output format of the `BITRISE_PERMANENT_DOWNLOAD_URL_MAP` so that the next Step can render the output.\nThe next Steps will use this input to generate the related output in the specified format. The output contains multiple permanent URLs for multiple artifacts.\nProvide a language template description using [https://golang.org/pkg/text/template](https://golang.org/pkg/text/template) so that the **Deploy to Bitrise.io** Step can build the required custom output.\n8. The **Test API's base URL** and the **API Token** input fields are automatically populated for you.\n9. The html report upload does not have any specific settings because it will happen automatically.\n\n### Configuring the Pipeline Intermediate File Sharing section of the Step\n\nThe **Files to share between pipeline stages** input specifies the files meant to be intermediate files shared between the Pipeline Stages. When uploading the Pipeline intermediate files, you must assign environment variable keys to them in the **Files to share between pipeline stages** input.\nThe inputs `path:env_key` values will be saved together with the file and later automatically reconstructed by the [Pull Pipeline intermediate files Step](https://www.bitrise.io/integrations/steps/pull-intermediate-files). \nYou can use a shorthand of just `env_var` for `$env_var:env_var`, when the `env_var` holds the path to the file(s) you want to share with subsequent stages.\nThe directories you specify will be archived and uploaded as a single file.\n\n#### Configuring the Debug section of the Step\n\nIf you wish to use any of the Step’s debug features, set the following inputs:\n1. In the **Name of the compressed artifact (without .zip extension)** input you can add a custom name for the compressed artifact. If you leave this input empty, the default `Deploy directory` name is used.\nPlease note that this input only works if you set the **Compress the artifacts into one file?** input to `true`.\n2. The **Bitrise Build URL** and the **Bitrise Build API Token** inputs are automatically populated.\n3. If **The Enable Debug Mode** required input is set to `true`, the Step prints more verbose logs. It is `false` by default. \n4. If you need a specific [bundletool version](https://github.com/google/bundletool/releases) other than the default value, you can modify the value of the **Bundletool version** required input. \nBundletool generates an APK from an Android App Bundle so that you can test the APK.\n\n### Troubleshooting\n\n- If your users did not get notified via email, check the **Enable public page for the App?** input. If it is set to `false`, no email notifications will be sent.\n- If there are no artifacts uploaded on the **APPS & ARTIFACTS tab**, then check the logs to see if the directory you used in the **Deploy directory or file path** input contained any artifacts. \n- If the email is not received, we recommend, that you check if the email is associated with Bitrise account and if so, if the account is “watching” the app.\n\n### Useful links\n\n- [Deployment on Bitrise](https://devcenter.bitrise.io/deploy/deployment-index/)\n- [Watching an app](https://devcenter.bitrise.io/builds/configuring-notifications/#watching-an-app)\n- [Using artifacts from different Stages](https://devcenter.bitrise.io/en/builds/build-pipelines/configuring-a-bitrise-pipeline.html#using-artifacts-from-different-stages)\n- [Viewing HTML reports](https://devcenter.bitrise.io/en/builds/build-data-and-troubleshooting/viewing-html-reports)\n  \n  ### Related Steps\n\n- [Deploy to Google Play](https://www.bitrise.io/integrations/steps/google-play-deploy)\n- [Deploy to iTunesConnect](https://www.bitrise.io/integrations/steps/deploy-to-itunesconnect-deliver)\n- [Pull Pipeline intermediate files](https://www.bitrise.io/integrations/steps/pull-intermediate-files)",
      website: 'https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io',
      source_code_url: 'https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io',
      support_url: 'https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io/issues',
      published_at: '2024-06-05T08:45:40.770036373Z',
      source: {
        git: 'https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io.git',
        commit: '45842c8d910ffd036a494cfb7456a730f6c7a0b5',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/deploy-to-bitrise-io/assets/icon.svg',
      },
      host_os_tags: ['osx-10.10'],
      type_tags: ['deploy'],
      toolkit: {
        go: {
          package_name: 'github.com/bitrise-steplib/steps-deploy-to-bitrise-io',
        },
      },
      is_requires_admin_user: false,
      is_always_run: true,
      is_skippable: false,
      run_if: '.IsCI',
      timeout: 0,
      outputs: [
        {
          BITRISE_PUBLIC_INSTALL_PAGE_URL: null,
          opts: {
            category: '',
            description: "Public Install Page's URL, if the\n*Enable public page for the App?* option was *enabled*.",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Public Install Page URL',
            unset: false,
          },
        },
        {
          BITRISE_PUBLIC_INSTALL_PAGE_URL_MAP: null,
          opts: {
            category: '',
            description:
              "Public Install Page URLs by the artifact's file path.\nOnly set it if the *Enable public page for the App?* option was *enabled*.\n\nThe default format is `KEY1=>VALUE|KEY2=>VALUE` but is controlled by the `public_install_page_url_map_format` input\n\nExamples:\n\n- $BITRISE_DEPLOY_DIR/ios_app.ipa=>https://ios_app/public/install/page\n- $BITRISE_DEPLOY_DIR/android_app.apk=>https://android_app/public/install/page|$BITRISE_DEPLOY_DIR/ios_app.ipa=>https://ios_app/public/install/page",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Map of filenames and Public Install Page URLs',
            unset: false,
          },
        },
        {
          BITRISE_PERMANENT_DOWNLOAD_URL_MAP: null,
          opts: {
            category: '',
            description:
              "The output contains permanent Download URLs for each artifact. The URLs can be shared in any communication channel and they won't expire.\nThe default format is `KEY1=>VALUE|KEY2=>VALUE` where key is the filename and the value is the URL.\nIf you change `permanent_download_url_map_format` input then that will modify the format of this Env Var.\nYou can customize the format of the multiple URLs.\n\nExamples:\n\n- $BITRISE_DEPLOY_DIR/ios_app.ipa=>https://app.bitrise.io/artifacts/ipa-slug/download\n- $BITRISE_DEPLOY_DIR/android_app.apk=>https://app.bitrise.io/artifacts/apk-slug/download|$BITRISE_DEPLOY_DIR/ios_app.ipa=>https://app.bitrise.io/artifacts/ipa-slug/download",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Map of filenames and Permanent Download URLs',
            unset: false,
          },
        },
        {
          BITRISE_ARTIFACT_DETAILS_PAGE_URL: null,
          opts: {
            category: '',
            description:
              "Details Page's URL.\n\nAt the moment, only installable artifacts (.aab, .apk, .ipa) have details page URL.",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Details Page URL',
            unset: false,
          },
        },
        {
          BITRISE_ARTIFACT_DETAILS_PAGE_URL_MAP: null,
          opts: {
            category: '',
            description:
              "Details Page URLs by the artifact's path. \n\nThe default format is `KEY1=>VALUE\\|KEY2=>VALUE` but is controlled by the `details_page_url_map_format` input\n\nExamples:\n\n- $BITRISE_DEPLOY_DIR/ios_app.ipa=>https://app.bitrise.io/apps/ios_app/installable-artifacts/ipa-slug\n- $BITRISE_DEPLOY_DIR/android_app.apk=>https://app.bitrise.io/apps/android_app/installable-artifacts/apk-slug|$BITRISE_DEPLOY_DIR/ios_app.ipa=>https://app.bitrise.io/apps/ios_app/installable-artifacts/ipa-slug",
            is_dont_change_value: false,
            is_expand: true,
            is_required: false,
            is_sensitive: false,
            is_template: false,
            skip_if_empty: false,
            summary: '',
            title: 'Map of filenames and Public Install Page URLs',
            unset: false,
          },
        },
      ],
    },
    objectID: '48767735000',
  },
  {
    info: {
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/azure-devops-status/assets/icon.svg',
      },
      maintainer: Maintainer.Community,
    },
    latest_version_number: '1.0.1',
    cvs: 'azure-devops-status@1.0.1',
    id: 'azure-devops-status',
    version: '1.0.1',
    is_latest: true,
    is_deprecated: false,
    step: {
      title: 'Azure DevOps status',
      summary: 'Update commit status for Azure DevOps repositories\n',
      description:
        'Update commit status for Azure DevOps repositories.\nThis step always runs, no matter if build succeeded or failed.\n',
      website: 'https://github.com/mediusoft/bitrise-step-azure-devops-status',
      source_code_url: 'https://github.com/mediusoft/bitrise-step-azure-devops-status',
      support_url: 'https://github.com/mediusoft/bitrise-step-azure-devops-status/issues',
      published_at: '2020-03-17T00:04:11.37749+02:00',
      source: {
        git: 'https://github.com/mediusoft/bitrise-step-azure-devops-status.git',
        commit: '1c28119b926f95b405ddad80b258ce9e414d44bf',
      },
      asset_urls: {
        'icon.svg': 'https://bitrise-steplib-collection.s3.amazonaws.com/steps/azure-devops-status/assets/icon.svg',
      },
      host_os_tags: ['osx-10.10', 'ubuntu-16.04'],
      type_tags: ['utility'],
      toolkit: {
        bash: {
          entry_file: 'step.sh',
        },
      },
      deps: {
        brew: [
          {
            name: 'curl',
          },
        ],
        apt_get: [
          {
            name: 'curl',
          },
        ],
      },
      is_requires_admin_user: false,
      is_always_run: true,
      is_skippable: true,
      run_if: 'not (enveq "BITRISE_GIT_COMMIT" "")',
      timeout: 0,
    },
    objectID: '33866073001',
  },
];

function getAlgoliaSteps({ status }: { status: 'success' | 'error' }) {
  return http.post('*/1/indexes/steplib_steps/browse', async () => {
    await delay();

    switch (status) {
      case 'success':
        return HttpResponse.json({ hits: Array.from(AlgoliaSteps) }, { status: 200 });
      case 'error':
      default:
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Not Found',
        });
    }
  });
}

function getLocalStep({ status }: { status: 'success' | 'error' }) {
  return http.post<never, { id: string }>('*/api/step-info', async ({ request }) => {
    const requestData = await request.json();
    await delay();

    switch (status) {
      case 'success':
        return HttpResponse.json(
          {
            id: requestData.id,
            title: requestData.id,
            inputs: [{ company: 'Bitrise' }],
          },
          { status: 200 },
        );

      case 'error':
      default:
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Not Found',
        });
    }
  });
}

export default { getAlgoliaSteps, getLocalStep };

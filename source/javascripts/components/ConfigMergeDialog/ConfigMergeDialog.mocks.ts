export const baseYaml = `---
format_version: '13'
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: other
meta:
  bitrise.io:
    stack: linux-docker-android-22.04
    machine_type_id: g2.linux.medium
workflows:
  unit-tests:
    steps:
    - script@1:
        title: Unit Tests
  lint:
    steps:
    - script@1:
        title: Lint
  integration-tests:
    steps:
    - script@1:
        title: integration-tests
  run-ci-checks:
    before_run:
    - lint
    - unit-tests
    - integration-tests
pipelines:
  my-ci-pipeline:
    workflows:
      lint: {}
      unit-tests: {}
      integration-tests: {}
`;

export const yourYaml = `---
format_version: '13'
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: other
meta:
  bitrise.io:
    stack: linux-docker-android-22.04
    machine_type_id: g2.linux.medium
workflows:
  unit-tests:
    steps:
    - script@1:
        title: Your Unit Tests
  lint:
    steps:
    - script@1:
        title: Lint
  integration-tests:
    steps:
    - script@1:
        title: integration-tests
  run-ci-checks:
    before_run:
    - lint-rm
    - unit-tests
    - integration-tests
pipelines:
  my-ci-pipeline:
    workflows:
      lint: {}
      unit-tests: {}
      integration-tests: {}
  my-tests-pipeline:
    workflows:
      unit-tests: {}
      integration-tests: {}
`;

export const remoteYaml = `---
format_version: '13'
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: other
meta:
  bitrise.io:
    stack: linux-docker-android-22.04
    machine_type_id: g2.linux.medium
workflows:
  unit-tests:
    steps:
    - script@1:
        title: Remote Unit Tests
  lint:
    steps:
    - script@1:
        title: Lint
  integration-tests:
    steps:
    - script@1:
        title: integration-tests
pipelines:
  my-ci-pipeline:
    workflows:
      lint: {}
      unit-tests: {}
      integration-tests: {}
`;

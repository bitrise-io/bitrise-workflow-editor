#!/bin/bash
set -x

if [[ "$next_version" == "" ]] ; then
  echo " [!] version_number not provided"
  exit 1
fi

version_file_path="$1"
plugin_definition_file_path="$2"

BITRISE_WORKFLOW_EDITOR_VERSION="$next_version" \
  BITRISE_WORKFLOW_EDITOR_VERSION_FILE="$version_file_path" \
  BITRISE_WORKFLOW_EDITOR_PLUGIN_DEFINITION_FILE="$plugin_definition_file_path" \
  go run _scripts/set_version.go

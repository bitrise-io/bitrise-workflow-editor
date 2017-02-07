#!/bin/bash
set -x

version_number=$next_version
if [[ "$version_number" == "" ]] ; then
  echo " [!] version_number not provided"
  exit 1
fi

version_file_path="$1"
if [ ! -f "$version_file_path" ] ; then
  echo " [!] version_file_path not provided, or file doesn't exist at path: $version_file_path"
  exit 1
fi

plugin_definition_file_path="$2"
if [ ! -f "$plugin_definition_file_path" ] ; then
  echo " [!] plugin_definition_file_path not provided, or file doesn't exist at path: $plugin_definition_file_path"
  exit 1
fi


BITRISE_WORKFLOW_EDITOR_VERSION="$version_number" \
  BITRISE_WORKFLOW_EDITOR_VERSION_FILE="$version_file_path" \
  BITRISE_WORKFLOW_EDITOR_PLUGIN_DEFINITION_FILE="$plugin_definition_file_path" \
  go run _scripts/set_version.go

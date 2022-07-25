#!/usr/bin/env bash

PORT=${1:-4000}
BITRISE_CONFIG=${2:-"./spec/integration/test_bitrise.yml"}
BITRISE_SECRETS=${2:-"./spec/integration/test_bitrise.secrets.yml"}
EXECUTABLE=./_bin/workflow-editor-Linux-x86_64

if [[ "$OSTYPE" == "darwin"* ]]; then
    EXECUTABLE=./_bin/workflow-editor-Darwin-x86_64
fi

if [[ "$DEV" == "true" ]]; then
    PORT=$PORT BITRISE_CONFIG=$BITRISE_CONFIG BITRISE_SECRETS=$BITRISE_SECRETS USE_DEV_SERVER=true go run main.go
else
    PORT=$PORT BITRISE_CONFIG=$BITRISE_CONFIG BITRISE_SECRETS=$BITRISE_SECRETS $EXECUTABLE
fi

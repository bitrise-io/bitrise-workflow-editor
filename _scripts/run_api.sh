#!/usr/bin/env bash

PORT=${1:-4000}
BITRISE_CONFIG=${2:-"./spec/integration/test_bitrise.yml"}
EXECUTABLE=./_bin/workflow-editor-Linux-x86_64

if [[ "$OSTYPE" == "darwin"* ]]; then
    EXECUTABLE=./_bin/workflow-editor-Darwin-x86_64
fi

if [[ "$DEV" == "true" ]]; then
    USE_DEV_SERVER=true BITRISE_CONFIG=$BITRISE_CONFIG gin --immediate --appPort=$PORT
else
    PORT=$PORT BITRISE_CONFIG=$BITRISE_CONFIG $EXECUTABLE
fi

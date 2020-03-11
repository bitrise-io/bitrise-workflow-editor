#!/usr/bin/env bash

EXECUTABLE=./_bin/workflow-editor-Linux-x86_64

if [[ "$OSTYPE" == "darwin"* ]]; then
    EXECUTABLE=./_bin/workflow-editor-Darwin-x86_64
fi

PORT=$PORT BITRISE_CONFIG=$1 $EXECUTABLE
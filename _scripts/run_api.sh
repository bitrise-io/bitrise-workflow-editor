#!/usr/bin/env bash

PORT=${1:-4000}
BITRISE_CONFIG=${2:-"./spec/integration/test_bitrise.yml"}
BITRISE_SECRETS=${2:-"./spec/integration/test_bitrise.secrets.yml"}

GO111MODULE=off BITRISE_CONFIG=$BITRISE_CONFIG BITRISE_SECRETS=$BITRISE_SECRETS PORT=$PORT go run main.go

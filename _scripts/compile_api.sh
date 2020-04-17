#!/bin/bash
set -ex

function assetst_precompile {
    echo "  Boxing assets..."

    go get github.com/GeertJohan/go.rice/rice
    DIST=./apiserver/www/

    mkdir -p $DIST
    cp -rf ./build/* $DIST

    pushd ./apiserver
        rice embed-go
    popd
}

function compile_bin {
    export GOARCH=amd64

    # Create Darwin bin
    export GOOS=darwin

    echo "  Create final Darwin binary at: $BIN_PATH_DARWIN"

    version_package="github.com/bitrise-io/bitrise-workflow-editor/version"

    go build \
        -ldflags "-X $version_package.BuildNumber=$BITRISE_BUILD_NUMBER -X $version_package.Commit=$GIT_CLONE_COMMIT_HASH" \
        -o "$BIN_PATH_DARWIN"

    # cp $BIN_PATH_DARWIN $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH
    echo "  Copy final Darwin binary to: $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH"


    # Create Linux binary
    export GOOS=linux

    echo "  Create final Linux binary at: $BIN_PATH_LINUX"

    go build \
        -ldflags "-X $version_package.BuildNumber=$BITRISE_BUILD_NUMBER -X $version_package.Commit=$GIT_CLONE_COMMIT_HASH" \
        -o "$BIN_PATH_LINUX"

    # cp $BIN_PATH_LINUX $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_LINUX-$BIN_ARCH
    echo "  Copy final Linux binary to: $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_LINUX-$BIN_ARCH"
}

echo "Create final binaries"
echo "  Package version: $NPM_PACKAGE_VERSION"
echo "  Build number: $BITRISE_BUILD_NUMBER"


assetst_precompile

compile_bin

#!/bin/bash
set -ex

function assetst_precompile {
    echo "  Boxing assets..."

    go install github.com/GeertJohan/go.rice/rice@latest
    export PATH="$(go env GOPATH)/bin:$PATH"
    DIST=./apiserver/www/

    mkdir -p $DIST
    cp -rf ./build/* $DIST

    pushd ./apiserver
        rice embed-go
    popd
}

function compile_bin {
    # Create Darwin bin
    export GOARCH=amd64
    export GOOS=darwin

    echo "  Create final Darwin-x86_64 binary at: $BIN_PATH_DARWIN"

    version_package="github.com/bitrise-io/bitrise-workflow-editor/version"

    go build \
        -ldflags "-X $version_package.BuildNumber=$BITRISE_BUILD_NUMBER -X $version_package.Commit=$GIT_CLONE_COMMIT_HASH" \
        -o "$BIN_PATH_DARWIN"

    # cp $BIN_PATH_DARWIN $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH
    echo "  Copy final Darwin-x86_64 binary to: $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH"


    echo "  Create final Darwin-arm64 binary at: $BIN_PATH_DARWIN_ARM64"
    export GOARCH=arm64

    # Download 1.16.4 go and build arm64 with it
    export ORIG_DIR=`pwd`
    export GO_TMP=/tmp/go1.16.4 && mkdir -p $GO_TMP

    UNAME=$(uname)

    if [ "$UNAME" == "Linux" ] ; then
      export GO_DL_OS="linux"
      export GO_DL_TAR_CMD="tar -xzf -"
    elif [ "$UNAME" == "Darwin" ] ; then
      export GO_DL_OS="darwin"
      export GO_DL_TAR_CMD="tar -xjf -"
    fi


    version_package="github.com/bitrise-io/bitrise-workflow-editor/version"

    go build \
        -ldflags "-X $version_package.BuildNumber=$BITRISE_BUILD_NUMBER -X $version_package.Commit=$GIT_CLONE_COMMIT_HASH" \
        -o "$BIN_PATH_DARWIN_ARM64"


    # cp $BIN_PATH_DARWIN $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH
    echo "  Copy final Darwin-arm64 binary to: $BITRISE_DEPLOY_DIR/$BIN_NAME-$BIN_OS_DARWIN-$BIN_ARCH_ARM64"


    # Create Linux binary
    export GOARCH=amd64
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

#!/usr/bin/env bash

FORKPTY="./_scripts/forkpty-$(uname -s)-$(uname -m)" 
if [ -e "$FORKPTY" ] && $FORKPTY true; then
    $FORKPTY $*
else
    $@
fi

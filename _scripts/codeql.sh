#!/usr/bin/env bash
#
# Analyzes the checked-out commit with CodeQL and uploads the results to GitHub code scanning.
# On a pull request, GitHub reports the alerts the PR adds compared to master in the "CodeQL"
# check, and that check is the gate. This script fails only if the analysis or upload fails.
#
#   CODEQL_GITHUB_TOKEN  Token that can write code scanning alerts (security_events scope).
#                        Without it, the SARIF files are written but not uploaded.
#   CODEQL_VERSION       CodeQL bundle version from the github/codeql-action releases.
#   CODEQL_WORK_DIR      Where the CLI, the databases and, off Bitrise, the SARIF files go.
set -euo pipefail

CODEQL_VERSION="${CODEQL_VERSION:-2.27.5}"
REPOSITORY="bitrise-io/bitrise-workflow-editor"
LANGUAGES=(javascript-typescript go)
WORK_DIR="${CODEQL_WORK_DIR:-${TMPDIR:-/tmp}/codeql}"
# On Bitrise, files in the deploy dir become build artifacts.
SARIF_DIR="${BITRISE_DEPLOY_DIR:-$WORK_DIR/results}"

cd "$(dirname "$0")/.."

build_mode() {
  case "$1" in
    go) echo autobuild ;;
    *) echo none ;;
  esac
}

sha256_check() {
  if command -v sha256sum >/dev/null; then sha256sum --check "$@"; else shasum --algorithm 256 --check "$@"; fi
}

install_codeql() {
  local install_dir="$WORK_DIR/codeql-$CODEQL_VERSION"
  CODEQL="$install_dir/codeql/codeql"
  [[ -x "$CODEQL" ]] && return

  local platform
  case "$(uname -s)" in
    Linux) platform=linux64 ;;
    Darwin) platform=osx64 ;;
    *) echo "No CodeQL bundle for $(uname -s)." >&2 && exit 1 ;;
  esac
  local archive="codeql-bundle-$platform.tar.gz"
  command -v zstd >/dev/null && archive="codeql-bundle-$platform.tar.zst"
  local url="https://github.com/github/codeql-action/releases/download/codeql-bundle-v$CODEQL_VERSION"

  mkdir -p "$install_dir"
  (
    cd "$install_dir"
    curl --fail --silent --show-error --location --retry 3 --remote-name "$url/$archive" --remote-name "$url/$archive.checksum.txt"
    sha256_check "$archive.checksum.txt"
    if [[ "$archive" == *.zst ]]; then zstd --decompress --stdout "$archive" | tar -x; else tar -xzf "$archive"; fi
    rm "$archive" "$archive.checksum.txt"
  )
}

# Sets REF and COMMIT to what GitHub should file the results under.
resolve_ref() {
  COMMIT="$(git rev-parse HEAD)"
  if [[ -n "${BITRISE_PULL_REQUEST:-}" ]]; then
    if [[ "$COMMIT" != "${BITRISE_GIT_COMMIT:-}" ]]; then
      echo "HEAD is $COMMIT, not the PR head ${BITRISE_GIT_COMMIT:-(unset)}. Clone with merge_pr: \"no\"." >&2
      exit 1
    fi
    REF="refs/pull/$BITRISE_PULL_REQUEST/head"
  else
    REF="refs/heads/${BITRISE_GIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
  fi
}

# Fork PRs get no secrets, so they skip the upload. Elsewhere on CI a missing token is a setup
# error, because PRs need master uploads to be compared against.
should_upload() {
  [[ -n "${CODEQL_GITHUB_TOKEN:-}" ]] && return 0
  if [[ -n "${CI:-}" && -z "${BITRISE_PULL_REQUEST:-}" ]]; then
    echo "CODEQL_GITHUB_TOKEN is not set." >&2
    exit 1
  fi
  echo "CODEQL_GITHUB_TOKEN is not set, so the results are not uploaded."
  return 1
}

install_codeql
"$CODEQL" version --format=terse
mkdir -p "$SARIF_DIR" "$WORK_DIR/databases"
UPLOAD=false
if should_upload; then
  UPLOAD=true
  resolve_ref
  echo "Uploading the results for $REF at $COMMIT."
fi

for language in "${LANGUAGES[@]}"; do
  database="$WORK_DIR/databases/$language"
  sarif="$SARIF_DIR/codeql-$language.sarif"

  "$CODEQL" database create "$database" --overwrite --source-root=. \
    --language="$language" --build-mode="$(build_mode "$language")"
  # With no query argument, analyze runs the language's code-scanning suite, the same as
  # default setup. The category matches default setup's too, so existing alerts carry over.
  "$CODEQL" database analyze "$database" --format=sarif-latest --output="$sarif" \
    --sarif-category="/language:$language" --threads=0

  echo "$language: $(jq '[.runs[].results[]] | length' "$sarif") result(s) in $sarif"

  if [[ "$UPLOAD" == true ]]; then
    "$CODEQL" github upload-results --repository="$REPOSITORY" --ref="$REF" --commit="$COMMIT" \
      --sarif="$sarif" --github-auth-stdin <<<"$CODEQL_GITHUB_TOKEN"
  fi
done

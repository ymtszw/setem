#!/usr/bin/env bash
set -euo pipefail


#    ______   __        ______          __                            __
#   /      \ /  |      /      |        /  |                          /  |
#  /$$$$$$  |$$ |      $$$$$$/        _$$ |_     ______    _______  _$$ |_
#  $$ |  $$/ $$ |        $$ |        / $$   |   /      \  /       |/ $$   |
#  $$ |      $$ |        $$ |        $$$$$$/   /$$$$$$  |/$$$$$$$/ $$$$$$/
#  $$ |   __ $$ |        $$ |          $$ | __ $$    $$ |$$      \   $$ | __
#  $$ \__/  |$$ |_____  _$$ |_         $$ |/  |$$$$$$$$/  $$$$$$  |  $$ |/  |
#  $$    $$/ $$       |/ $$   |        $$  $$/ $$       |/     $$/   $$  $$/
#   $$$$$$/  $$$$$$$$/ $$$$$$/          $$$$/   $$$$$$$/ $$$$$$$/     $$$$/
#

#
# Call entrypoint script file (src/setem.js) with arguments,
# then compare their result with fixtures using `diff`!
#

export GIT_PAGER=""

# Cleanup leftovers
  rm -f timestamp.* RecordSetter.elm src/RecordSetter.elm src/fixtures/RecordSetter.elm


# Should generate from a single source file
  src/setem.js src/fixtures/RecordDefAndExpr.elm
  git diff --no-index RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate from multiple source files
  src/setem.js src/fixtures/RecordDefAndExpr.elm src/fixtures/OnlyRecordDef.elm
  git diff --no-index RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate from multiple source files with glob
  src/setem.js src/fixtures/*.elm
  git diff --no-index RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate to stdout
  src/setem.js --stdout src/fixtures/*.elm |
  diff --ignore-blank-lines -u - src/fixtures/minimal-cli-result


# Should generate to directory
  src/setem.js --output src/ src/fixtures/*.elm
  git diff --no-index src/RecordSetter.elm src/fixtures/minimal-cli-result && rm src/RecordSetter.elm


STAT=$(if which gstat > /dev/null; then echo "gstat"; else echo "stat"; fi)
# Should not regenerate if the content is not changed
  src/setem.js --output src/fixtures/ src/fixtures/*.elm | grep "[*] created"
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/minimal-cli-result
  $STAT --format="%Y" src/fixtures/RecordSetter.elm > timestamp.first
  src/setem.js --output src/fixtures/ src/fixtures/*.elm | diff -q /dev/null -
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/minimal-cli-result
  $STAT --format="%Y" src/fixtures/RecordSetter.elm > timestamp.second
  git diff --no-index timestamp.first timestamp.second
  rm src/fixtures/RecordSetter.elm timestamp.*


# Should update the file if the output is changed
  src/setem.js --output src/fixtures/ src/fixtures/*.elm | grep "[*] created"
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/minimal-cli-result
  src/setem.js --output src/fixtures/ src/fixtures/**/*.elm | grep "[*] updated"
  rm src/fixtures/RecordSetter.elm


# Should allow blank string for prefix option
  src/setem.js --prefix '' --output src/fixtures/ src/fixtures/*.elm | grep "[*] created"
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/blank-prefix-result
  rm src/fixtures/RecordSetter.elm


# Should NOT include generated file itself (must be idempotent)
  src/setem.js --verbose --output src/fixtures/ src/fixtures/*.elm | grep "[*] created"
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/minimal-cli-result
  src/setem.js --verbose --output src/fixtures/ src/fixtures/*.elm | grep -v "RecordSetter.elm"
  git diff --no-index src/fixtures/RecordSetter.elm src/fixtures/minimal-cli-result
  rm src/fixtures/RecordSetter.elm


# Should fail if elm.json is missing without option
  if src/setem.js 1> /dev/null 2> /dev/null; then
    echo "setem should have failed but succeeded"
    exit 1
  else
    echo "Failed as expected"
  fi


# Should generate from full project without option
  pushd src/fixtures/elm-spa-example
    ../../../src/setem.js
    git diff --no-index RecordSetter.elm ../elm-spa-example-cli-result && rm RecordSetter.elm
  popd


# Should generate from full project with --elm-json option
  src/setem.js --elm-json src/fixtures/elm-spa-example/elm.json
  git diff --no-index RecordSetter.elm src/fixtures/elm-spa-example-cli-result && rm RecordSetter.elm

# Should respect ELM_HOME on generation, with downloading all teh deps
  ELM_HOME=$(realpath tmp/.elm/)
  export ELM_HOME
  rm -rf "$ELM_HOME"
  mkdir -p "$ELM_HOME"
  src/setem.js --elm-json src/fixtures/elm-spa-example/elm.json
  git diff --no-index RecordSetter.elm src/fixtures/elm-spa-example-cli-result && rm RecordSetter.elm

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


# Should generate from explicit source file
  src/setem.js src/fixtures/RecordDefAndExpr.elm
  diff -u RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate from multiple source files
  src/setem.js src/fixtures/RecordDefAndExpr.elm src/fixtures/OnlyRecordDef.elm
  diff -u RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate from multiple source files with glob
  src/setem.js src/fixtures/*.elm
  diff -u RecordSetter.elm src/fixtures/minimal-cli-result && rm RecordSetter.elm


# Should generate to stdout
  src/setem.js --stdout src/fixtures/*.elm |
  diff --ignore-blank-lines -u - src/fixtures/minimal-cli-result


# Should generate to directory
  src/setem.js --output src/ src/fixtures/*.elm
  diff -u src/RecordSetter.elm src/fixtures/minimal-cli-result && rm src/RecordSetter.elm


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
    diff -u RecordSetter.elm ../elm-spa-example-cli-result && rm RecordSetter.elm
  popd


# Should generate from full project with --elm-json option
  src/setem.js --elm-json src/fixtures/elm-spa-example/elm.json
  diff -u RecordSetter.elm src/fixtures/elm-spa-example-cli-result && rm RecordSetter.elm

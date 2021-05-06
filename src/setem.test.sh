#!/usr/bin/env bash
set -euo pipefail

# Generate from explicit source file
src/setem.js src/fixtures/RecordDefAndExpr.elm
diff RecordSetter.elm src/fixtures/minimal-cli-result

# Generate from full project with --elm-json option
src/setem.js --elm-json src/fixtures/elm-spa-example/elm.json
diff RecordSetter.elm src/fixtures/elm-spa-example-cli-result

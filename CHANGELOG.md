# Changelog

## Upcoming

...

## 0.6.1

* It *SHOULD* now support Bun as its runtime 🎉
  * See `bun-checks` in [`sanity_check` workflow](https://github.com/ymtszw/setem/actions/workflows/sanity_check.yml) for what's confirmed

## 0.6.0

* Support Node.js 22
* [**BREAKING**] Drop support for Node.js 14

## 0.5.0

* [**Behavioral Change**] It now automatically downloads all the missing dependencies using dummy application and `elm make`
* Support Node.js 20

## 0.4.0

* Support Node.js 18
* [**BREAKING**] Drop support for Node.js 12

## 0.3.6

* Fix `--prefix` option with test. Thanks again [@choonkeat](https://github.com/)!

## 0.3.5

* Update deps to support ARM64 environments notably Apple Silicon macOS
  * Also adjust version specifier to accept wider range of dependencies

## 0.3.4

* Do not write a file if generated output is not changed
* Print as "updated" on file update

## 0.3.3

* Exclude generated file itself from source paths, was causing no-longer-existing record fields to linger

## 0.3.2

* Skip non-existing paths in expansion, was causing runtime error when `tests/` missing in the project

## 0.3.1

* Fix error in npm script

## 0.3.0 (Deprecated)

* Support generation for an Elm project, including dependencies!

## 0.2.0

* Support `--prefix` option ([#1](https://github.com/ymtszw/setem/pull/1)). Thanks [@choonkeat](https://github.com/)!

## 0.1.0

* Support `--output` as an alias to `--src`

## 0.0.3

* Expand directories in path

## 0.0.2

* Generate from extensible records
* Generate from record patterns
* Fix: only generate from lower_case_identifier from left-hand side

## 0.0.1

* Initial release
* Generate from type definition and expression

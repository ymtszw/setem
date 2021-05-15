#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const chalk = require("chalk");
const { name, description, version } = require("../package.json");
const { generate, resolvePaths } = require("./index");

const program = new Command();
program
  .name(name)
  .description(description)
  .version(version)
  .option(
    "--stdout",
    "Print generated file contents to stdout instead of a file"
  )
  .option(
    "--src, --output <srcDirectory>",
    "Set Elm src directory to write generated file to. Defaults to current working directory"
  )
  .option(
    "--prefix <function prefix>",
    "Set prefix of generated functions. Defaults to `s_`"
  )
  .option(
    "--module <moduleName>",
    `Set generated module name (also, file name). Defaults to \`RecordSetter\`.
Must be fully qualified
`
  )
  .option(
    "--elm-json <elm.json file path>",
    `Set path to elm.json file you would like to use for automatic source and dependency detection.
Takes effect only if explicit paths are NOT given.
Defaults to ./elm.json`
  )
  .option("--verbose", "Print all loaded files")
  .arguments("[paths...]")
  .action(mainAction);

function mainAction(args, options) {
  const module = options.module || "RecordSetter";
  const prefix = options.prefix || "s_";
  const elmJsonFile = options.elmJson || "./elm.json";
  const hasExplicitPaths = args.length !== 0;
  const moduleFilename = path.join(...module.split(".")) + ".elm";
  const outputPath = path.resolve(
    options.src || options.output || process.cwd(),
    moduleFilename
  );
  // Do not include generated file itself, so that no-longer-existing record fields are propertly removed from the result!
  const paths = resolvePaths(args, elmJsonFile).filter(
    (path) => path !== outputPath
  );

  if (options.verbose) for (const path of paths) fileLoaded(path);
  const generated = generate(
    paths,
    module,
    prefix,
    elmJsonFile,
    hasExplicitPaths
  );

  if (options.stdout) {
    console.log(generated);
  } else {
    const dir = path.dirname(outputPath);
    fs.mkdir(dir, { recursive: true }, (e, path) => {
      if (e) throw e;
      if (path) fileGenerated(path);
      fs.readFile(outputPath, { encoding: "utf8" }, (e, current) => {
        if (e) {
          if (e.code === "ENOENT") {
            // Generate anew
            fs.writeFile(outputPath, generated, (e) => {
              if (e) throw e;
              fileGenerated(outputPath);
            });
          } else {
            throw e;
          }
        } else if (generated === current) {
          // Skip
        } else {
          fs.writeFile(outputPath, generated, (e) => {
            if (e) throw e;
            fileUpdated(outputPath);
          });
        }
      });
    });
  }
}

function fileLoaded(path) {
  console.log(chalk.cyan("* loaded: ") + path);
}

function fileGenerated(path) {
  console.log(chalk.green("* created: ") + path);
}

function fileUpdated(path) {
  console.log(chalk.yellow("* updated: ") + path);
}

program.parse(process.argv);

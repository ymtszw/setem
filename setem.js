#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const chalk = require("chalk");
const { name, description, version } = require("./package.json");
const generate = require("./index");

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
    "--src <srcDirectory>",
    "Set Elm src directory. Defaults to current working directory"
  )
  .option(
    "--module <moduleName>",
    `Set generated module name (also, file name). Defaults to \`RecordSetter\`.
Must be fully qualified
`
  )
  .option("--verbose", "Print all loaded files")
  .arguments("<paths...>")
  .action(mainAction);

function mainAction(paths) {
  const module = program.module || "RecordSetter";
  if (program.verbose) for (const path of paths) fileLoaded(path);
  const generated = generate(paths, module);

  if (program.stdout) {
    console.log(generated);
  } else {
    const srcFilename = path.join(...module.split(".")) + ".elm";
    const filename = path.resolve(program.src || process.cwd(), srcFilename);
    const dir = path.dirname(filename);
    fs.mkdir(dir, { recursive: true }, (e, path) => {
      if (e) throw e;
      if (path) fileGenerated(path);
      fs.writeFile(filename, generated, (e) => {
        if (e) throw e;
        fileGenerated(filename);
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

program.parse(process.argv);

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const cli = path.resolve(__dirname, "setem.js");
let projectDir;

beforeEach(() => {
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "setem-download-test-"));
  fs.mkdirSync(path.join(projectDir, "src"));
  fs.mkdirSync(path.join(projectDir, "bin"));
  fs.writeFileSync(path.join(projectDir, "src", "Main.elm"), "module Main exposing (..)\ntype alias Model = { localField : Int }\n");
  fs.writeFileSync(
    path.join(projectDir, "elm.json"),
    JSON.stringify({
      type: "application",
      "source-directories": ["src"],
      "elm-version": "0.19.1",
      dependencies: { direct: { "elm/core": "1.0.0" }, indirect: {} },
      "test-dependencies": { direct: {}, indirect: {} },
    }),
  );
  // An executable compiler stand-in exercises the real CLI/process boundary.
  fs.writeFileSync(
    path.join(projectDir, "bin", "elm"),
    `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.SETEM_TEST_PROJECT;
const countFile = path.join(root, "attempts");
const attempt = fs.existsSync(countFile) ? Number(fs.readFileSync(countFile)) + 1 : 1;
fs.writeFileSync(countFile, String(attempt));
const cache = path.join(process.cwd(), "elm-stuff", "0.19.1");
if (attempt > 1 && fs.existsSync(cache)) {
  console.error("compiler cache was not cleared");
  process.exit(2);
}
const mode = process.env.SETEM_TEST_COMPILER_MODE;
if (mode === "compile-error") {
  console.error("TYPE MISMATCH: genuine compiler error");
  process.exit(1);
}
if (mode === "signal") {
  console.error(path.join(cache, "d.dat") + ": openBinaryFile: resource busy (file is locked)");
  process.kill(process.pid, "SIGTERM");
}
if (mode === "always-locked" || ((mode === "open" || mode === "with" || mode === "other-file") && attempt < 3)) {
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(path.join(cache, "d.dat"), "incomplete compiler cache");
  const file = path.join(cache, mode === "other-file" ? "o.dat" : "d.dat");
  const operation = mode === "with" ? "withBinaryFile" : "openBinaryFile";
  console.error(file + ": " + operation + ": resource busy (file is locked)");
  process.exit(1);
}
const dependency = path.join(process.env.ELM_HOME, "0.19.1", "packages", "elm", "core", "1.0.0", "src");
fs.mkdirSync(dependency, { recursive: true });
fs.writeFileSync(path.join(dependency, "Core.elm"), "module Core exposing (..)\\ntype alias Model = { dependencyField : Int }\\n");
console.log("compiler completed");
`,
    { mode: 0o755 },
  );
});

afterEach(() => {
  fs.rmSync(projectDir, { recursive: true, force: true });
});

function runCli(mode) {
  const result = spawnSync(process.execPath, [cli, "--stdout"], {
    cwd: projectDir,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: [path.join(projectDir, "bin"), process.env.PATH].join(path.delimiter),
      ELM_HOME: path.join(projectDir, "elm-home"),
      SETEM_TEST_PROJECT: projectDir,
      SETEM_TEST_COMPILER_MODE: mode,
    },
  });
  expect(result.error).toBeUndefined();
  const attempts = Number(fs.readFileSync(path.join(projectDir, "attempts")));
  return { ...result, attempts };
}

test("downloads dependencies and generates setters without retry on success", () => {
  const result = runCli("success");
  expect(result.status).toBe(0);
  expect(result.attempts).toBe(1);
  expect(result.stdout).toContain("s_dependencyField");
  expect(result.stdout).toContain("s_localField");
  expect(result.stderr).toBe("");
});

test.each(["open", "with"])("recovers from %sBinaryFile d.dat lock failures and generates setters", (mode) => {
  const result = runCli(mode);
  expect(result.status).toBe(0);
  expect(result.attempts).toBe(3);
  expect(result.stdout).toContain("compiler completed");
  expect(result.stdout).toContain("s_dependencyField");
  expect(result.stdout).toContain("s_localField");
  expect(result.stderr).toContain("resource busy (file is locked)");
  expect(result.stderr).toContain("retrying compilation (3/3)");
});

test("fails after three attempts if the d.dat lock persists", () => {
  const result = runCli("always-locked");
  expect(result.status).not.toBe(0);
  expect(result.attempts).toBe(3);
  expect(result.stderr).toContain("resource busy (file is locked)");
  expect(result.stdout).not.toContain("module RecordSetter");
});

test.each(["compile-error", "other-file"])("does not retry or suppress %s failures", (mode) => {
  const result = runCli(mode);
  expect(result.status).not.toBe(0);
  expect(result.attempts).toBe(1);
  expect(result.stderr).toContain(mode === "compile-error" ? "TYPE MISMATCH" : "o.dat: openBinaryFile");
  expect(result.stderr).not.toContain("retrying compilation");
  expect(result.stdout).not.toContain("module RecordSetter");
});

test("does not retry a compiler terminated by a signal", () => {
  const result = runCli("signal");
  expect(result.status).not.toBe(0);
  expect(result.attempts).toBe(1);
  expect(result.stderr).toContain("SIGTERM");
  expect(result.stderr).not.toContain("retrying compilation");
  expect(result.stdout).not.toContain("module RecordSetter");
});

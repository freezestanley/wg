#!/usr/bin/env node

const args = process.argv.slice(2);
const commandText = args.join(" ");

function fail(code, message) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function hasPythonHeredocWrite(command) {
  const hasPython = /\bpython(?:3)?\b/.test(command);
  const hasHeredoc = /<<['"]?[A-Za-z_][A-Za-z0-9_]*['"]?/.test(command);
  const hasWrite = /\.write_text\s*\(|\.write_bytes\s*\(|\bopen\s*\([^)]*,\s*['"][wa]/s.test(command);
  return hasPython && hasHeredoc && hasWrite;
}

function hasLiteralProjectRootPath(command) {
  return /(?:Path|open)\(\s*["'][^"'\\]*(?:\$(?:\{)?PROJECT_ROOT\b|\$\{PROJECT_ROOT\})[^"']*["']/s.test(command);
}

function hasShellHeredocWrite(command) {
  const hasHeredoc = /<<['"]?[A-Za-z_][A-Za-z0-9_]*['"]?/.test(command);
  if (!hasHeredoc) return false;
  return /\bcat\b[\s\S]*[>]{1,2}\s*["'][^"']+["']|\btee\b[\s\S]*["'][^"']+["']/s.test(command);
}

if (!commandText.trim()) {
  fail(1, "WORKFLOW COMMAND GUARD FAILED: 缺少待检查命令");
}

if (hasLiteralProjectRootPath(commandText)) {
  fail(
    3,
    "WORKFLOW COMMAND GUARD FAILED: 检测到把 $PROJECT_ROOT 字面量写进 Python heredoc 路径。请把路径通过 argv、环境变量或脚本参数传入，不要在 <<'PY' 中直接写 $PROJECT_ROOT。"
  );
}

if (hasPythonHeredocWrite(commandText)) {
  fail(
    2,
    "WORKFLOW COMMAND GUARD FAILED: 禁止使用 Python heredoc 直接写项目文件。请改用 apply_patch / 编辑工具，或把路径通过 argv、环境变量或脚本参数传入专用脚本。"
  );
}

if (hasShellHeredocWrite(commandText)) {
  fail(
    4,
    "WORKFLOW COMMAND GUARD FAILED: 禁止使用 shell heredoc 直接写项目文件。请改用 apply_patch / 编辑工具。"
  );
}

process.stdout.write("WORKFLOW COMMAND GUARD OK\n");

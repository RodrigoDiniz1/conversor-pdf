const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..', '..', '..');
const DEFAULT_ENV_PATH = path.join(projectRoot, '.env');
const ENV_LINE_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

const stripInlineComment = (value) => {
  let isSingleQuoted = false;
  let isDoubleQuoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const previousChar = value[index - 1];

    if (char === "'" && !isDoubleQuoted && previousChar !== '\\') {
      isSingleQuoted = !isSingleQuoted;
    }

    if (char === '"' && !isSingleQuoted && previousChar !== '\\') {
      isDoubleQuoted = !isDoubleQuoted;
    }

    if (char === '#' && !isSingleQuoted && !isDoubleQuoted && /\s/.test(previousChar || '')) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value;
};

const unquoteValue = (value) => {
  const trimmedValue = stripInlineComment(value.trim());
  const quote = trimmedValue[0];

  if ((quote !== '"' && quote !== "'") || trimmedValue.at(-1) !== quote) {
    return trimmedValue;
  }

  const unquotedValue = trimmedValue.slice(1, -1);

  if (quote === "'") {
    return unquotedValue;
  }

  return unquotedValue
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
};

const parseEnvLine = (line) => {
  const trimmedLine = line.replace(/^\uFEFF/, '').trim();

  if (!trimmedLine || trimmedLine.startsWith('#')) {
    return null;
  }

  const match = trimmedLine.match(ENV_LINE_PATTERN);

  if (!match) {
    return null;
  }

  return {
    key: match[1],
    value: unquoteValue(match[2])
  };
};

const loadEnvFile = (envPath = DEFAULT_ENV_PATH) => {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const envFileContent = fs.readFileSync(envPath, 'utf8');

  envFileContent.split(/\r?\n/).forEach((line) => {
    const parsedLine = parseEnvLine(line);

    if (!parsedLine || Object.prototype.hasOwnProperty.call(process.env, parsedLine.key)) {
      return;
    }

    process.env[parsedLine.key] = parsedLine.value;
  });

  return true;
};

module.exports = {
  loadEnvFile
};

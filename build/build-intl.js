const yaml = require('js-yaml');
const intlParser = require('intl-messageformat-parser');
const glob = require('globby');
const path = require('path');
const fs = require('fs');
const lodash = require('lodash');
const prettier = require('prettier');

async function* findTranslationFiles(langDir) {
  const langFiles = await glob('*.mcu.yml', { cwd: langDir });
  //console.log('Found language files: ', langFiles);

  for (const file of langFiles) {
    let lang = path.basename(file, '.mcu.yml');
    yield { lang, file: path.resolve(langDir, file) };
  }
}

async function* getTranslations(langDir) {
  for await (const { lang, file } of findTranslationFiles(langDir)) {
    const baseLang = new Intl.Locale(lang).language;
    const source = await fs.promises.readFile(file, { encoding: 'utf-8' });
    const raw = yaml.safeLoad(source);
    const values = [];

    for (const [key, mcu] of Object.entries(raw)) {
      const ast = intlParser.parse(mcu);
      values.push({ key, mcu, ast });
    }

    yield { lang, file, values };
  }
}

async function buildTranslationsGraph(langDir, fallbackLang = 'en') {
  let fallback = null;
  let all = [];

  for await (const { lang, values } of getTranslations(langDir)) {
    const vals = new Map();

    for (const { key, ast } of values) {
      vals.set(key, ast);
    }

    const result = {
      lang,
      values: vals,
    };
    all.push(result);

    if (lang === fallbackLang) {
      fallback = result;
    }
  }

  if (fallback === null) {
    throw new Error(
      `Fallback language '${fallbackLang}' not found. Available languages: ${JSON.stringify(all.map(l => l.lang))}`,
    );
  }

  const keys = new Map();
  for (const key of fallback.values.keys()) {
    const camelCase = lodash.camelCase(key);
    const converted = camelCase.charAt(0).toUpperCase() + camelCase.substr(1);
    if (keys.has(converted)) {
      throw new Error(`Both '${key}' and '${keys.get(converted)}' converts to PascalCase '${converted}'.`);
    }

    keys.set(converted, key);
  }

  for (const lang of all) {
    for (const key of lang.values.keys()) {
      if (!fallback.values.has(key)) {
        throw new Error(
          `Language '${lang.lang}' has key '${key}' which is not present in fallback language '${fallbackLang}'.`,
        );
      }
    }
  }

  return { keys, languages: all };
}

async function buildTranslations(langDir, fallbackLang = 'en') {
  const { keys, languages } = await buildTranslationsGraph(langDir, fallbackLang);
  const reverseKeys = new Map();
  for (const [key, value] of keys.entries()) {
    reverseKeys.set(value, key);
  }

  const src = [];

  // TODO: imports
  src.push("import { IntlMessageFormat } from 'intl-messageformat';");
  src.push('');

  src.push('export type Language =');
  for (const l of languages.values()) {
    src.push(`| ${JSON.stringify(l.lang)}`);
  }
  src.push(';');

  src.push('export const languages: Language[] = [');
  for (const l of languages.values()) {
    src.push(`${JSON.stringify(l.lang)},`);
  }
  src.push('];');
  src.push(`export const fallback: Language = ${JSON.stringify(fallbackLang)};`);
  src.push('export const formats = new Map<Language, Map<Strings, IntlMessageFormat>>();');
  src.push('');

  src.push('export const enum Strings {');
  for (const [key, value] of keys.entries()) {
    src.push(`${key} = ${JSON.stringify(value)},`);
  }
  src.push('}');
  src.push('');

  for (const { lang, values } of languages) {
    src.push(`formats.set(${JSON.stringify(lang)}, (() => {`);
    src.push('const values = new Map<Strings, IntlMessageFormat>();');
    for (const [key, value] of values) {
      src.push(
        `values.set(Strings.${reverseKeys.get(key)}, new IntlMessageFormat(${JSON.stringify(value)}, ${JSON.stringify(
          lang,
        )}));`,
      );
    }
    src.push('return values;');
    src.push('})());');
  }

  const joined = src.join('\n');
  return prettier.format(joined, { parser: 'typescript' });
}

export async function writeTranslations(langDir, fallbackLang = 'en') {
  const file = path.resolve(langDir, 'index.ts');
  const source = await buildTranslations(langDir, fallbackLang);
  await fs.promises.writeFile(file, source, { encoding: 'utf-8' });
}

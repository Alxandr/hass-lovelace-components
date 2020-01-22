import { IntlMessageFormat, PrimitiveType } from 'intl-messageformat';
import { Language, Strings, fallback, formats, languages } from './languages';
import { NodePart, Part, directive } from 'lit-html';

export type Formatter = (key: Strings) => IntlMessageFormat;

export const createFormatter: (locale: string) => Formatter = locale => {
  let lang: Language | null = null;
  if (languages.includes(locale as Language)) {
    lang = locale as Language;
  } else {
    const parsedLang: string = new (Intl as any).Locale(locale).language;
    if (languages.includes(parsedLang as Language)) {
      lang = parsedLang as Language;
    }
  }

  if (lang == null) {
    lang = fallback;
  }

  return (key: Strings) => {
    const format = formats.get(lang!)?.get(key) ?? formats.get(fallback)!.get(key);

    if (!format) {
      throw new Error(`Format for key '${key}' not found.`);
    }

    return format;
  };
};

const cache = new Map<string, Formatter>();

const getOrCreateFormatter = (locale: string) => {
  if (!cache.has(locale)) {
    cache.set(locale, createFormatter(locale));
  }

  return cache.get(locale)!;
};

export const localizeToString = (key: Strings, values?: Record<string, PrimitiveType>) => {
  const lang = (localStorage.getItem('selectedLanguage') || fallback).replace(/['"]+/g, '');
  return getOrCreateFormatter(lang)(key).format(values);
};

// Stores the nested parts associated with a single instance of the directive
const nestedPartMap = new WeakMap<NodePart, NodePart[]>();

// Creates a new nested part and adds it to the DOM
// managed by containerPart
const createAndAppendPart = (containerPart: NodePart) => {
  const newPart = new NodePart(containerPart.options);
  newPart.appendIntoPart(containerPart);

  return newPart;
};

export const localize = directive((key: Strings, values?: Record<string, any>) => {
  const lang = (localStorage.getItem('selectedLanguage') || fallback).replace(/['"]+/g, '');
  const format = getOrCreateFormatter(lang)(key);
  const messageParts = format.formatToParts();

  const apply = (containerPart: Part) => {
    if (!(containerPart instanceof NodePart)) {
      throw new Error('duplicate directive can only be used in content bindings');
    }

    const old = nestedPartMap.get(containerPart);
    if (old === undefined) {
      const childParts = messageParts.map(messagePart => {
        const childPart = createAndAppendPart(containerPart);
        childPart.setValue(messagePart.value);
        childPart.commit();
        return childPart;
      });

      nestedPartMap.set(containerPart, childParts);
    } else if (old.length !== messageParts.length) {
      containerPart.clear();
      nestedPartMap.delete(containerPart);
      apply(containerPart);
    } else {
      for (let i = 0; i < old.length; i++) {
        old[i].setValue(messageParts[i].value);
        old[i].commit();
      }
    }
  };

  return apply;
});

export { Strings };

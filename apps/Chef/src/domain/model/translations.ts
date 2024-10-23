import { frTranslations } from './translations/fr';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];
export type TranslationKey = NestedKeyOf<typeof frTranslations>;
const translationsMap = {
  fr: frTranslations,
};

export function $t(
  template: TranslationKey,
  placeholders: { [key: string]: string | number } = {},
  lang: 'fr' | 'en' = 'fr'
): string {
  let translations = translationsMap[lang];
  const keys = template.split('.');

  for (const key of keys) {
    translations = translations[key];
    if (!translations) {
      break;
    }
  }

  if (translations && typeof translations === 'string') {
    return translations.replace(
      /\{\{(.*?)}}/g,
      (_, key) => placeholders[key.trim()].toString() || ''
    );
  }

  return `[[${template}]]`;
}

export type TranslateFunction = (key: string, options?: Partial<TranslateOptions>) => string;

export interface TranslatorInterface {
    t: TranslateFunction;
    /** @deprecated use locale() instead */
    language(language?: string): string;
    locale(locale?: string | Intl.Locale): void;
    short(): string;
    long(): string;
    region(): string;
    script(): string | undefined;
    addResource(language: string, translations: Translations): void;
    addPlugin(plugin: TranslatorPlugin, language?: string): void;
    listen(listener: Listener): Unsubscribe;
}

export type Translations = {
    [key: string]: string | Translations;
};

export type ParsedTranslations = {
    [search: string]: string;
};

export type TranslateOptions = {
    context: string;
    count: number;
    replace: {
        [search: string]: string | number | Date;
    };
};

export type LanguageOptions = {
    default: string;
    fallback: string;
};

export type Listener = () => void;
export type Unsubscribe = () => void;

export type TranslatorPlugin = (
    translated: string,
    options: Partial<TranslateOptions>,
    usedLocale: string,
    translator: TranslatorInterface,
) => string | undefined;

export type PluginRegistry = {
    [tag: string]: TranslatorPlugin[];
};

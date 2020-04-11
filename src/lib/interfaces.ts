export type TranslateFunction = (key: string, options?: Partial<TranslateOptions>) => string;

export interface TranslatorInterface {
    t: TranslateFunction;
    language(language?: string): string;
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
        [search: string]: string | number;
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
    translator: TranslatorInterface,
) => string | undefined;

export type PluginRegistry = {
    [language: string]: TranslatorPlugin[];
};

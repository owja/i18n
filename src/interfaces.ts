export interface ITranslator {
    t(key: string, options: Partial<ITranslateOptions>): string;
    language(language?: string): string;
    addResource(language: string, translations: ITranslations): void;
    addPlugin(language: string, plugin: TranslatorPlugin): void;
    listen(listener: Listener): Unsubscribe;
}

export interface ITranslations {
    [key: string]: string | ITranslations;
}

export interface IParsedTranslations {
    [search: string]: string;
}

export interface ITranslateOptions {
    context: string;
    count: number;
    replace: {
        [search: string]: string;
    };
}

export interface ILanguageOptions {
    default: string;
    fallback: string;
}

export type Listener = () => void;
export type Unsubscribe = () => void;

export type TranslatorPlugin = (
    translated: string,
    options: Partial<ITranslateOptions>,
    translator: ITranslator,
) => string | undefined;

export interface IPluginRegistry {
    [language: string]: TranslatorPlugin[];
}

interface ITranslations {
    [key: string]: string | ITranslations;
}

interface IParsedTranslations {
    [search: string]: string;
}

interface ITranslateOptions {
    context: string;
    count: number;
    replace: {
        [search: string]: string;
    };
}

interface ILanguageOptions {
    default: string;
    fallback: string;
}

type Listener = () => void;
type Unsubscribe = () => void;

export type TranslatorPlugin = (value: string, options?: Partial<ITranslateOptions>) => string | undefined;

export class Translator {
    private readonly _options: ILanguageOptions = {
        default: "en",
        fallback: "en",
    };

    private _listener: Listener[] = [];
    private _resources: IParsedTranslations = {};
    private _language: string = "en";
    private _plugins: TranslatorPlugin[] = [];

    constructor(options: Partial<ILanguageOptions> = {}) {
        this._options = {...this._options, ...options};
        this._language = this._options.default;
    }

    t(key: string, options: Partial<ITranslateOptions> = {}): string {
        if (options.replace === undefined) options.replace = {};
        let pattern: string[] = [key];

        if (options.context) pattern.unshift((key = `${key}_${options.context}`));

        if (typeof options.count === "number") {
            if (options.count !== 1) pattern.unshift(`${key}_plural`);
            pattern.unshift(`${key}_${options.count}`);
            options.replace["count"] = options.count.toString();
        }

        let translated = "";
        [this._language, this._options.fallback].find(
            (language) => !!pattern.find((pat) => !!(translated = this._resources[`${language}.${pat}`])),
        );

        if (!translated) return key;

        if (this._plugins.length) {
            this._plugins.forEach((plugin) => {
                translated = plugin(translated, options) || translated;
            });
        }

        for (const find in options.replace) {
            translated = translated.replace("{{" + find + "}}", options.replace[find]);
        }

        return translated;
    }

    language(language?: string): string {
        if (language && this._language !== language) {
            this._language = language;
            this._trigger();
        }
        return this._language;
    }

    addResource(language: string, translations: ITranslations) {
        if (/[^a-z]/.test(language)) throw `only a-z allowed: "${language}"`;
        this._resources = {...this._resources, ...this._parse(translations, language)};
    }

    addPlugin(plugin: TranslatorPlugin) {
        this._plugins.push(plugin);
    }

    listen(listener: Listener): Unsubscribe {
        const unsubscribe = () => {
            const idx = this._listener.indexOf(listener);
            if (idx === -1) return;
            this._listener.splice(idx, 1);
        };

        if (this._listener.indexOf(listener) !== -1) return unsubscribe;
        this._listener.push(listener);
        return unsubscribe;
    }

    private _parse(translations: ITranslations, base: string): IParsedTranslations {
        let parsed: IParsedTranslations = {};

        for (const prop in translations) {
            const value = translations[prop];
            if (typeof value !== "string" && typeof value !== "object") continue;

            const key = `${base}.${prop}`;

            if (typeof value === "string") {
                if (/[^a-zA-Z0-9_]/.test(prop)) throw `only a-Z, 0-9 and underscore allowed: "${prop}"`;
                parsed[key] = value;
            } else {
                if (/[^a-zA-Z0-9]/.test(prop)) throw `only a-Z and 0-9 allowed: "${prop}"`;
                parsed = {...parsed, ...this._parse(value, key)};
            }
        }

        return parsed;
    }

    private _trigger() {
        this._listener.forEach((cb) => cb());
    }
}

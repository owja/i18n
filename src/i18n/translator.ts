interface IOptions {
    defaultLanguage?: string;
    languageFallback?: string;
    defaultNamespace?: string;
    namespaceFallback?: string;
}

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

type Listener = () => void;
type Unsubscribe = () => void;

export type TranslatorPlugin = (value: string, options?: Partial<ITranslateOptions>) => string | undefined;

function validateTag(str: string) {
    if (/[^a-z]/.test(str)) throw `only a-Z and 0-9 allowed: "${str}".`;
}

function validateProp(str: string, topLevel: boolean) {
    if (topLevel && /[^a-zA-Z0-9_]/.test(str)) throw `only a-Z, 0-9 and underscore allowed: "${str}".`;
    if (!topLevel && /[^a-zA-Z0-9]/.test(str)) throw `only a-Z and 0-9 allowed: "${str}".`;
}

export class Translator {
    private readonly _options: IOptions = {
        defaultLanguage: "en",
        languageFallback: "en",
        defaultNamespace: "global",
        namespaceFallback: "global",
    };

    private _listener: Listener[] = [];
    private _resources: IParsedTranslations = {};
    private _language: string = "en";
    private _plugins: TranslatorPlugin[] = [];

    constructor(options?: IOptions) {
        this._options = {...this._options, ...options};
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        this._language = this._options.defaultLanguage!;
    }

    t(search: string, options?: Partial<ITranslateOptions>): string {
        if (typeof options === "undefined") options = {};
        if (typeof options.replace === "undefined") options = {...options, replace: {}};

        let [namespace, key] = search.split(":");

        key = typeof key === "undefined" ? `${this._options.defaultNamespace}.${namespace}` : namespace + "." + key;

        let pattern: string[] = [key];

        if (options.context) {
            key = `${key}_${options.context}`;
            pattern.unshift(key);
        }

        if (typeof options.count === "number") {
            if (options.count !== 1) pattern.unshift(`${key}_plural`);
            pattern.unshift(`${key}_${options.count}`);
            /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
            options.replace!["count"] = options.count.toString();
        }

        let translated = "";
        [this._language, this._options.languageFallback].find(
            (language) =>
                !!pattern.find((pat) => {
                    if (typeof this._resources[`${language}.${pat}`] === "string") {
                        translated = this._resources[`${language}.${pat}`];
                        return true;
                    }
                    return false;
                }),
        );

        if (translated === "") return search;

        if (this._plugins.length) {
            this._plugins.forEach((plugin) => {
                const value = plugin(translated, options);
                if (typeof value === "string") translated = value;
            });
        }

        for (const find in options.replace) {
            translated = translated.replace("{{" + find + "}}", options.replace[find]);
        }

        return translated;
    }

    language(language?: string): string {
        language && validateTag(language);
        if (language) {
            this._language = language;
            this._trigger();
        }
        return this._language;
    }

    addResource(language: string, namespace: string, translations: ITranslations): Translator {
        validateTag(language);
        validateTag(namespace);
        this._resources = {...this._resources, ...this._parse(translations, `${language}.${namespace}`)};
        return this;
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
                validateProp(prop, true);
                parsed[key] = value;
            } else {
                validateProp(prop, false);
                parsed = {...parsed, ...this._parse(value, key)};
            }
        }

        return parsed;
    }

    private _trigger() {
        this._listener.forEach((cb) => cb());
    }
}

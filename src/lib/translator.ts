export type TranslateFunction = (key: string, options?: Partial<TranslateOptions>) => string;

export interface TranslatorInterface {
    t: TranslateFunction;
    /** @deprecated use locale() instead */
    language(language?: string): string;
    locale(locale?: string | Intl.Locale): void;
    short(): string;
    long(): string;
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
    translator: TranslatorInterface,
) => string | undefined;

export type PluginRegistry = {
    [tag: string]: TranslatorPlugin[];
};

export class Translator implements TranslatorInterface {
    private readonly _options: LanguageOptions = {
        default: "en-US",
        fallback: "en",
    };

    private _listener: Listener[] = [];
    private _resources: ParsedTranslations = {};
    private _registry: PluginRegistry = {};

    private _locale: Intl.Locale;

    constructor(options: Partial<LanguageOptions> = {}) {
        this._options = {...this._options, ...options};
        this._locale = Translator._maximize(this._options.default);
        this.t = this.t.bind(this);
    }

    /**
     * Main translate function
     */
    t(key: string, options: Partial<TranslateOptions> = {}): string {
        if (options.replace === undefined) options.replace = {};
        const pattern: string[] = [key];

        if (options.context) pattern.unshift((key = `${key}_${options.context}`));

        if (typeof options.count === "number") {
            // ToDo enhance this with Intl.plural
            if (options.count !== 1) pattern.unshift(`${key}_plural`);
            pattern.unshift(`${key}_${options.count}`);
            options.replace["count"] = options.count.toString();
        }

        // search for translations is done by
        //   first find by long locale like "de-DE"
        //   if none found find by short locale like "de"
        //   if still none found search by the fallback which is by default "en"
        let translated = "";
        [this.long(), this.short(), this._options.fallback].find(
            (tag) => !!pattern.find((pat) => !!(translated = this._resources[`${tag}.${pat}`])),
        );

        if (!translated) return key;

        for (const find in options.replace) {
            const replace = options.replace[find].toString();
            translated = translated.replace(new RegExp(Translator._escapeRegExp("{{" + find + "}}"), "g"), replace);
        }

        // search for plugins is done by
        //   first find by long locale like "en-US"
        //   if none found find by short locale like "en"
        //   if still none found at least search in "global" registry
        (this._registry[this.long()] || [])
            .concat(this._registry[this.short()] || [])
            .concat(this._registry["global"] || [])
            .forEach((plugin) => {
                translated = plugin(translated, options, this) || translated;
            });

        return translated;
    }

    /**
     * @deprecated use Translator.locale() instead
     */
    language(language?: string): string {
        if (language && this._locale.language !== language) {
            this._locale = Translator._maximize(language);
            this._trigger();
        }
        return this.short();
    }

    /**
     * Set the locale by language tag or a Intl.Locale object
     */
    locale(locale: string | Intl.Locale): void {
        const old = this.long();
        this._locale = Translator._maximize(locale);
        if (old !== this.long()) this._trigger();
    }

    /**
     * Get the short locale which is just the language like "en"
     */
    short(withScript?: boolean): string {
        return `${this._locale.language}${this.script() && withScript ? `-${this.script()}` : ""}`;
    }

    /**
     * Get the region of the locale like "US" from "en-US"
     */
    region(): string {
        // it is verified when the locale is set
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._locale.region!;
    }

    /**
     * Get the script of the locale like "Cyrl" from "uz-Cyrl-UZ"
     */
    script(): string | undefined {
        return this._locale.script;
    }

    /**
     * Get the long locale which is the language and the region like "en-US"
     * If the locale was set with script, then this will also return the script like "uz-Cyrl-UZ"
     */
    long(): string {
        return `${this.short(true)}-${this.region()}`;
    }

    /**
     * Add translations for a language tag
     */
    addResource(languageTag: string, translations: Translations) {
        languageTag = this.validateLanguageTag(languageTag);
        this._resources = {...this._resources, ...this._parse(translations, languageTag)};
        this._trigger();
    }

    /**
     * Add a plugin for a language tag
     */
    addPlugin(plugin: TranslatorPlugin, languageTag = "global") {
        if (languageTag !== "global") {
            languageTag = this.validateLanguageTag(languageTag);
        }

        if (this._registry[languageTag] === undefined) {
            this._registry[languageTag] = [];
        }
        this._registry[languageTag].push(plugin);
        this._trigger();
    }

    /**
     * Tests if a string is a valid language tag
     * returns the formatted tag
     *
     * https://en.wikipedia.org/wiki/IETF_language_tag
     */
    validateLanguageTag(tag: string): string {
        return new Intl.Locale(tag).toString();
    }

    /**
     * Register a listener which will be triggered when:
     *   - translations are added
     *   - plugins are added
     *   - locale get changed
     */
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

    private static _maximize(locale: string | Intl.Locale): Intl.Locale {
        let localeObj: Intl.Locale;
        if (typeof locale === "string") {
            localeObj = new Intl.Locale(locale);
        } else {
            localeObj = locale;
        }

        const withScript = !!localeObj.script;
        localeObj = localeObj.maximize();

        // we only need script (only if it was passed), region and language
        localeObj = new Intl.Locale(locale.toString(), {
            script: withScript ? localeObj.script : undefined,
            region: localeObj.region,
            language: localeObj.language,
        });

        if (!localeObj.region) {
            throw `the region can not guessed by the locale "${localeObj.toString()}" please use a full locale.`;
        }

        if (!localeObj.language) {
            throw `the language can not guessed by the locale "${localeObj.toString()}" please use a full locale.`;
        }

        return localeObj;
    }

    private static _escapeRegExp(string: string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    private _parse(translations: Translations, base: string): ParsedTranslations {
        let parsed: ParsedTranslations = {};

        for (const prop of Object.keys(translations || {})) {
            const value = translations[prop];
            if (typeof value !== "string" && typeof value !== "object") continue;

            const key = `${base}.${prop}`;

            if (typeof value === "string") {
                if (/[^a-zA-Z0-9_\-]/.test(prop)) throw `only a-Z, 0-9, minus sign and underscore allowed: "${prop}"`;
                parsed[key] = value;
            } else {
                if (/[^a-zA-Z0-9\-]/.test(prop)) throw `only a-Z, minus sign and 0-9 allowed: "${prop}"`;
                parsed = {...parsed, ...this._parse(value, key)};
            }
        }

        return parsed;
    }

    private _trigger() {
        this._listener.forEach((cb) => cb());
    }
}

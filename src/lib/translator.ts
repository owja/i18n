import {_maximize, _parse, _validateLanguageTag} from "./utils";

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
    translator: TranslatorInterface,
) => string | undefined;

export type PluginRegistry = {
    [tag: string]: TranslatorPlugin[];
};

const GLOBAL = "global";

export class Translator implements TranslatorInterface {
    private readonly _options: LanguageOptions = {
        default: "en-US",
        fallback: "en",
    };

    private _listener: Listener[] = [];
    private _resources: ParsedTranslations = {};
    private _registry: PluginRegistry = {};

    private _locale: Intl.Locale;
    private _pluralRule: Intl.PluralRules;

    constructor(options: Partial<LanguageOptions> = {}) {
        this._options = {...this._options, ...options};
        this._locale = _maximize(this._options.default);
        this._pluralRule = new Intl.PluralRules(this.long());
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
            pattern.unshift(`${key}_${this._pluralRule.select(options.count).toString()}`);
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
            translated = translated.replace(
                new RegExp("{{" + find + "}}".replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"), "g"),
                options.replace[find].toString(),
            );
        }

        // search for plugins is done by
        //   first find by long locale like "en-US"
        //   if none found find by short locale like "en"
        //   if still none found at least search in "global" registry
        (this._registry[this.long()] || [])
            .concat(this._registry[this.short()] || [])
            .concat(this._registry[GLOBAL] || [])
            .forEach((plugin) => {
                translated = plugin(translated, options, this) || translated;
            });

        return translated;
    }

    /**
     * @deprecated use Translator.locale() instead - this will be removed in final release
     */
    language(language?: string): string {
        if (language && this._locale.language !== language) {
            this._locale = _maximize(language);
            this._pluralRule = new Intl.PluralRules(this.long());
            this._trigger();
        }
        return this.short();
    }

    /**
     * Set the locale by language tag or a Intl.Locale object
     */
    locale(locale: string | Intl.Locale): void {
        const old = this.long();
        this._locale = _maximize(locale);
        this._pluralRule = new Intl.PluralRules(this.long());
        if (old !== this.long()) this._trigger();
    }

    /**
     * Get the short locale which is just the language like "en"
     * It returns with script if it was set like "uz-Curl" instead of "uz"
     */
    short(): string {
        return `${this._locale.language}${this.script() ? `-${this.script()}` : ""}`;
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
        return `${this.short()}-${this.region()}`;
    }

    /**
     * Add translations for a language tag
     */
    addResource(languageTag: string, translations: Translations) {
        languageTag = _validateLanguageTag(languageTag);
        this._resources = {...this._resources, ..._parse(translations, languageTag)};
        this._trigger();
    }

    /**
     * Add a plugin for a language tag
     */
    addPlugin(plugin: TranslatorPlugin, languageTag = GLOBAL) {
        if (languageTag !== GLOBAL) {
            languageTag = _validateLanguageTag(languageTag);
        }

        if (this._registry[languageTag] === undefined) {
            this._registry[languageTag] = [];
        }
        this._registry[languageTag].push(plugin);
        this._trigger();
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

    private _trigger() {
        this._listener.forEach((cb) => cb());
    }
}

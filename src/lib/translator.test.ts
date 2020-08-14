import {Translator} from "../";
import testResource from "../test/test.json";
import {testFullLocales, testShortLocales} from "../test/locales";

describe("Translator", () => {
    let instance: Translator;
    beforeEach(() => {
        instance = new Translator();
    });

    test("will have default options", () => {
        expect((instance as any)._options.fallback).toBe("en");
        expect((instance as any)._options.default).toBe("en-US");
        expect(instance.short()).toBe("en");
        expect(instance.long()).toBe("en-US");
    });

    test("can set options", () => {
        instance = new Translator({
            fallback: "es",
            default: "it",
        });

        expect((instance as any)._options.fallback).toBe("es");
        expect((instance as any)._options.default).toBe("it");
    });

    test("can set partial options", () => {
        instance = new Translator({
            default: "de",
        });

        expect((instance as any)._options.fallback).toBe("en");
        expect((instance as any)._options.default).toBe("de");
    });

    test("can change the language", () => {
        instance.locale("de");
        expect(instance.short()).toBe("de");
        expect(instance.long()).toBe("de-DE");
    });

    test('can set "all" short locales', () => {
        for (const locale of testShortLocales) {
            instance.locale(locale);
            expect(instance.short(true)).toBe(locale);
        }
    });

    test('can set "all" full locales', () => {
        for (const locale of testFullLocales) {
            instance.locale(locale);
            expect(instance.long()).toBe(locale);
        }
    });

    test("can change the language by passing a Intl.Locale object", () => {
        instance.locale(new Intl.Locale("de"));
        expect(instance.short()).toBe("de");
        expect(instance.long()).toBe("de-DE");
    });

    test("can change the language with deprecated language() method too", () => {
        instance.language("de");
        expect(instance.short()).toBe("de");
        expect(instance.long()).toBe("de-DE");
    });

    test("should trigger listener on language change", () => {
        const spy = jest.fn();
        instance.listen(spy);
        instance.locale("de");
        instance.locale("en-GB");
        expect(spy).toHaveBeenCalledTimes(2);
        expect(instance.short()).toBe("en");
        expect(instance.long()).toBe("en-GB");
    });

    test("should trigger listener only if language is really changed", () => {
        const spy = jest.fn();
        instance.listen(spy);
        instance.locale("de");
        instance.locale("de");
        expect(spy).toHaveBeenCalledTimes(1);
        expect(instance.short()).toBe("de");
    });

    test("should not trigger listener on language change after unregister", () => {
        const spy = jest.fn();
        const unregister = instance.listen(spy);
        instance.locale("de");
        unregister();
        instance.locale("en");
        expect(spy).toHaveBeenCalledTimes(1);
        expect(instance.short()).toBe("en");
    });

    test("can register a listener only once", () => {
        const listener = () => undefined;
        instance.listen(listener);
        instance.listen(listener);
        expect((instance as any)._listener).toHaveLength(1);
    });

    test("can unregister a listener only if it is not unregistered before", () => {
        const listener = () => undefined;
        const unregister = instance.listen(listener);
        unregister();
        unregister();
        expect((instance as any)._listener).toHaveLength(0);
    });

    test("validateLanguageTag should return expected strings", () => {
        expect(instance.validateLanguageTag("de")).toBe("de");
        expect(instance.validateLanguageTag("de-DE")).toBe("de-DE");
        expect(instance.validateLanguageTag("DE-DE")).toBe("de-DE");
        expect(instance.validateLanguageTag("DE")).toBe("de");
    });

    test("validateLanguageTag should throw with bad format", () => {
        let thrown = false;
        try {
            instance.validateLanguageTag("de_DE");
        } catch {
            thrown = true;
        }
        expect(thrown).toBe(true);
    });

    describe("resources", () => {
        test("with one dimension can be added", () => {
            instance.addResource("de", {
                "my-string-one": "My string number one",
                myStringTwo: "My string number two",
            });
            expect((instance as any)._resources).toEqual({
                "de.my-string-one": "My string number one",
                "de.myStringTwo": "My string number two",
            });
        });

        test("with multi dimensions can be added", () => {
            instance.addResource("de", {
                myStringOne: "My string number one",
                my: {
                    stringTwo: "My string number two",
                    string: {
                        three: "My string number three",
                    },
                    stringFour: "My string number four",
                },
                myStringFive: "My string number five",
            });
            expect((instance as any)._resources).toEqual({
                "de.myStringOne": "My string number one",
                "de.my.stringTwo": "My string number two",
                "de.my.string.three": "My string number three",
                "de.my.stringFour": "My string number four",
                "de.myStringFive": "My string number five",
            });
        });

        test("only with alpha-numeric with optional underscore keys can be added on top level", () => {
            const bad = [
                {"string:one": "one"},
                {"string=two": "two"},
                {DJJürgen: "DJ Günther"},
                {"DJ Gunther": "DJGunther"},
            ];

            bad.forEach((data) => {
                expect(() => instance.addResource("de", data as any)).toThrow(
                    `only a-Z, 0-9, minus sign and underscore allowed: "${Object.keys(data)[0]}"`,
                );
            });
        });

        test("with underscore can be added on top level", () => {
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            expect(() => instance.addResource("de", {string_three: "three"})).not.toThrow();
        });

        test("only with alpha-numeric keys (and minus sign) can be added if they have children", () => {
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            const bad = [{string_one: {two: "two"}}, {"string three": {four: "four"}}, {string_five: {six: "six"}}];

            bad.forEach((data) => {
                expect(() => instance.addResource("de", data as any)).toThrow(
                    `only a-Z, minus sign and 0-9 allowed: "${Object.keys(data)[0]}"`,
                );
            });
        });

        test("only with data of type string or object can be added", () => {
            const bad = [{one: undefined}, {two: null}, {three: 100}, {four: 0}, {five: {six: Symbol.for("sym")}}];

            bad.forEach((data) => {
                instance.addResource("de", data as any);
                expect((instance as any)._resources).toEqual({});
            });
        });

        test("only valid language tags can be added", () => {
            const bad = ["d:e", "e.n", "f-r", " se", "se "];

            bad.forEach((data) => {
                expect(() => instance.addResource(data, {x: "x"})).toThrow(`Incorrect locale information provided`);
            });
        });
    });

    describe("with loaded resources", () => {
        beforeEach(() => {
            instance.addResource("de", testResource.de);
            instance.addResource("de-CH", testResource["de-CH"]);
            instance.addResource("en", testResource.en);
        });

        test("can translate", () => {
            instance.locale("de");
            expect(instance.t("item")).toBe("Ein Dings");
            instance.locale("en");
            expect(instance.t("item")).toBe("1 item");
        });

        test("can not translate missing values", () => {
            expect(instance.t("notExisting")).toBe("notExisting");
            expect(instance.t("notExisting:item")).toBe("notExisting:item");
        });

        test("can translate with count option", () => {
            instance.locale("de");
            expect(instance.t("item", {count: -1})).toBe("-1 Dingens");
            expect(instance.t("item", {count: 0})).toBe("0 Dingens");
            expect(instance.t("item", {count: 1})).toBe("Ein Dings");
            expect(instance.t("item", {count: 10})).toBe("10 Dingens");
            instance.locale("en");
            expect(instance.t("item", {count: -1})).toBe("-1 items");
            expect(instance.t("item", {count: 0})).toBe("Zero items");
            expect(instance.t("item", {count: 1})).toBe("1 item");
            expect(instance.t("item", {count: 2})).toBe("2 items");
            expect(instance.t("item", {count: 10})).toBe("10 items");
        });

        test("can translate with replace option", () => {
            instance.locale("de");
            expect(instance.t("hello", {replace: {what: "Welt"}})).toBe("Hallo Welt");
            expect(instance.t("hello2", {replace: {what: "Welt"}})).toBe("Hallo Welt Welt");
            instance.locale("en");
            expect(instance.t("hello", {replace: {what: "World"}})).toBe("Hello World");
            expect(instance.t("hello2", {replace: {what: "World"}})).toBe("Hello World World");
        });

        test("can translate without the right replace option and will leave the pattern", () => {
            instance.locale("de");
            expect(instance.t("hello", {replace: {nottherightone: "Welt"}})).toBe("Hallo {{what}}");
        });

        test("will simply replace dates with a string", () => {
            instance.locale("de");
            const translated = instance.t("hello", {replace: {what: new Date(2020, 1, 2)}});
            expect(translated).not.toContain("{{what}}");
            expect(translated).toContain("2020");
            expect(translated).toContain("Hallo ");
        });

        test("can translate with context option", () => {
            instance.locale("de");
            expect(instance.t("ownerCar", {context: "male"})).toBe("Sein Auto");
            expect(instance.t("ownerCar", {context: "female"})).toBe("Ihr Auto");
            instance.locale("en");
            expect(instance.t("ownerCar", {context: "male"})).toBe("his car");
            expect(instance.t("ownerCar", {context: "female"})).toBe("her car");
        });

        test("can translate with context and count option", () => {
            instance.locale("en");
            expect(instance.t("ownerCar", {context: "male", count: 1})).toBe("his car");
            expect(instance.t("ownerCar", {context: "female", count: 1})).toBe("her car");
            expect(instance.t("ownerCar", {context: "male", count: 2})).toBe("his cars");
            expect(instance.t("ownerCar", {context: "female", count: 2})).toBe("her cars");
        });

        test("can translate with context and count option with fallback", () => {
            instance.locale("de");
            expect(instance.t("ownerCar", {count: 1})).toBe("Auto");
            expect(instance.t("ownerCar", {count: 1})).toBe("Auto");
            expect(instance.t("ownerCar", {context: "male", count: 2})).toBe("Sein Auto");
            expect(instance.t("ownerCar", {context: "female", count: 2})).toBe("Ihr Auto");
        });

        test("can translate from sub resources", () => {
            instance.locale("de");
            expect(instance.t("sub.something")).toBe("etwas");
            expect(instance.t("sub.else")).toBe("anderes");
            instance.locale("en");
            expect(instance.t("sub.something")).toBe("something");
            expect(instance.t("sub.else")).toBe("else");
        });

        test("can translate with to 2 level fallback", () => {
            instance.locale("de-DE");
            expect(instance.t("item")).toBe("Ein Dings");
            instance.locale("de-CH");
            expect(instance.t("item")).toBe("Ein anderes Dings");
            expect(instance.t("de-only")).toBe("only in german");
            expect(instance.t("en-only")).toBe("only in english");
        });

        test("can translate from sub resources with language tag fallback", () => {
            instance.locale("de-CH");
            expect(instance.t("sub.something")).toBe("etwas");
            expect(instance.t("sub.else")).toBe("anderes");
            instance.locale("en-FR");
            expect(instance.t("sub.something")).toBe("something");
            expect(instance.t("sub.else")).toBe("else");
        });
    });
});

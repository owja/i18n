import {Translator} from "./translator";
import testResource from "../test/test.json";

describe("Translator", () => {
    let instance: Translator;
    beforeEach(() => {
        instance = new Translator();
    });

    test("will have default options", () => {
        expect((instance as any)._options.languageFallback).toBe("en");
        expect((instance as any)._options.namespaceFallback).toBe("global");
        expect((instance as any)._options.defaultLanguage).toBe("en");
        expect((instance as any)._options.defaultNamespace).toBe("global");
        expect(instance.language()).toBe("en");
    });

    test("can set options", () => {
        instance = new Translator({
            languageFallback: "es",
            namespaceFallback: "somewhere",
            defaultLanguage: "it",
            defaultNamespace: "else",
        });

        expect((instance as any)._options.languageFallback).toBe("es");
        expect((instance as any)._options.namespaceFallback).toBe("somewhere");
        expect((instance as any)._options.defaultLanguage).toBe("it");
        expect((instance as any)._options.defaultNamespace).toBe("else");
    });

    test("can set partial options", () => {
        instance = new Translator({
            defaultLanguage: "de",
        });

        expect((instance as any)._options.languageFallback).toBe("en");
        expect((instance as any)._options.namespaceFallback).toBe("global");
        expect((instance as any)._options.defaultLanguage).toBe("de");
        expect((instance as any)._options.defaultNamespace).toBe("global");
    });

    test("can change the language without registered listeners", () => {
        instance.language("de");
        expect(instance.language()).toBe("de");
    });

    test("should trigger listener on language change", () => {
        const spy = jest.fn();
        instance.listen(spy);
        instance.language("de");
        instance.language("en");
        expect(spy).toHaveBeenCalledTimes(2);
        expect(instance.language()).toBe("en");
    });

    test("should not trigger listener on language change after unregister", () => {
        const spy = jest.fn();
        const unregister = instance.listen(spy);
        instance.language("de");
        unregister();
        instance.language("en");
        expect(spy).toHaveBeenCalledTimes(1);
        expect(instance.language()).toBe("en");
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

    describe("resources", () => {
        test("with one dimension can be added", () => {
            instance.addResource("de", "myns", {
                myStringOne: "My string number one",
                myStringTwo: "My string number two",
            });
            expect((instance as any)._resources).toEqual({
                "de.myns.myStringOne": "My string number one",
                "de.myns.myStringTwo": "My string number two",
            });
        });

        test("with multi dimensions can be added", () => {
            instance.addResource("de", "myns", {
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
                "de.myns.myStringOne": "My string number one",
                "de.myns.my.stringTwo": "My string number two",
                "de.myns.my.string.three": "My string number three",
                "de.myns.my.stringFour": "My string number four",
                "de.myns.myStringFive": "My string number five",
            });
        });

        test("only with alpha-numeric with optional underscore keys can be added on top level", () => {
            const bad = [
                {"string:one": "one"},
                {"string-two": "two"},
                {DJJürgen: "DJ Günther"},
                {"DJ Gunther": "DJGunther"},
            ];

            bad.forEach((data) => {
                expect(() => instance.addResource("de", "myns", data as any)).toThrow(
                    `only a-Z, 0-9 and underscore allowed: "${Object.keys(data)[0]}".`,
                );
            });
        });

        test("with underscore can be added on top level", () => {
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            expect(() => instance.addResource("de", "myns", {string_three: "three"})).not.toThrow();
        });

        test("only with alpha-numeric keys can be added if they have children", () => {
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            const bad = [{string_one: {two: "two"}}, {"string three": {four: "four"}}, {"string-five": {six: "six"}}];

            bad.forEach((data) => {
                expect(() => instance.addResource("de", "myns", data as any)).toThrow(
                    `only a-Z and 0-9 allowed: "${Object.keys(data)[0]}".`,
                );
            });
        });

        test("only with data of type string or object can be added", () => {
            const bad = [{one: undefined}, {two: null}, {three: 100}, {four: 0}, {five: {six: Symbol.for("sym")}}];

            bad.forEach((data) => {
                instance.addResource("de", "myns", data as any);
                expect((instance as any)._resources).toEqual({});
            });
        });

        test("only with alpha-numeric namespace tag can be added", () => {
            const bad = ["n:s", "n.s", "n-s", "n_s", " ns", "ne "];

            bad.forEach((data) => {
                expect(() => instance.addResource("de", data, {x: "x"})).toThrow(
                    `only a-Z and 0-9 allowed: "${data}".`,
                );
            });
        });

        test("only with alpha-numeric language tag can be added", () => {
            const bad = ["d:e", "e.n", "f-r", " se", "se "];

            bad.forEach((data) => {
                expect(() => instance.addResource(data, "myns", {x: "x"})).toThrow(
                    `only a-Z and 0-9 allowed: "${data}".`,
                );
            });
        });
    });

    describe("with loaded resources", () => {
        beforeEach(() => {
            instance.addResource("de", "global", testResource.de.global);
            instance.addResource("en", "global", testResource.en.global);
            instance.addResource("en", "space", testResource.en.space);
            instance.addResource("en", "main", testResource.en.main);
            instance.addResource("de", "main", testResource.de.main);
        });

        test("can translate from global namespace", () => {
            instance.language("de");
            expect(instance.t("item")).toBe("Ein Dings");
            expect(instance.t("global:item")).toBe("Ein Dings");
            instance.language("en");
            expect(instance.t("item")).toBe("1 item");
            expect(instance.t("global:item")).toBe("1 item");
        });

        test("can translate from user defined namespace", () => {
            instance.language("de");
            expect(instance.t("main:hello")).toBe("Und tschüss Welt");
            instance.language("en");
            expect(instance.t("main:hello")).toBe("Bye bye World");
        });

        test("can not translate missing values", () => {
            expect(instance.t("notExisting")).toBe("notExisting");
            expect(instance.t("notExisting:item")).toBe("notExisting:item");
        });

        test("can translate with count option", () => {
            instance.language("de");
            expect(instance.t("item", {count: -1})).toBe("-1 Dingens");
            expect(instance.t("item", {count: 0})).toBe("0 Dingens");
            expect(instance.t("item", {count: 1})).toBe("Ein Dings");
            expect(instance.t("item", {count: 10})).toBe("10 Dingens");
            instance.language("en");
            expect(instance.t("item", {count: -1})).toBe("-1 items");
            expect(instance.t("item", {count: 0})).toBe("Zero items");
            expect(instance.t("item", {count: 1})).toBe("1 item");
            expect(instance.t("item", {count: 2})).toBe("2 items");
            expect(instance.t("item", {count: 10})).toBe("10 items");
        });

        test("can translate with replace option", () => {
            instance.language("de");
            expect(instance.t("hello", {replace: {what: "Welt"}})).toBe("Hallo Welt");
            instance.language("en");
            expect(instance.t("hello", {replace: {what: "World"}})).toBe("Hello World");
        });

        test("can translate with context option", () => {
            instance.language("de");
            expect(instance.t("ownerCar", {context: "male"})).toBe("Sein Auto");
            expect(instance.t("ownerCar", {context: "female"})).toBe("Ihr Auto");
            instance.language("en");
            expect(instance.t("ownerCar", {context: "male"})).toBe("his car");
            expect(instance.t("ownerCar", {context: "female"})).toBe("her car");
        });

        test("can translate with context and count option", () => {
            instance.language("en");
            expect(instance.t("ownerCar", {context: "male", count: 1})).toBe("his car");
            expect(instance.t("ownerCar", {context: "female", count: 1})).toBe("her car");
            expect(instance.t("ownerCar", {context: "male", count: 2})).toBe("his cars");
            expect(instance.t("ownerCar", {context: "female", count: 2})).toBe("her cars");
        });

        test("can translate with context and count option with fallback", () => {
            instance.language("de");
            expect(instance.t("ownerCar", {count: 1})).toBe("Auto");
            expect(instance.t("ownerCar", {count: 1})).toBe("Auto");
            expect(instance.t("ownerCar", {context: "male", count: 2})).toBe("Sein Auto");
            expect(instance.t("ownerCar", {context: "female", count: 2})).toBe("Ihr Auto");
        });

        test("can translate from sub resources", () => {
            instance.language("de");
            expect(instance.t("sub.something")).toBe("etwas");
            expect(instance.t("sub.else")).toBe("anderes");
            instance.language("en");
            expect(instance.t("sub.something")).toBe("something");
            expect(instance.t("sub.else")).toBe("else");
        });
    });
});

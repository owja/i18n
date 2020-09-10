import {TranslatorPlugin, Translator} from "../";
import {createNumberPlugin} from "../plugins";

const testCasesOne = [
    {q: "xxxx [[number]] xxx [[number]]", e: "xxxx 0 xxx 0"},
    {q: "xxxx [[number|5]] xxx [[number]]", e: "xxxx 5 xxx 0"},
    {q: "xxxx [[number|3.234]] xxx [[number]]", e: "xxxx 3,234 xxx 0"},
    {q: "xxxx [[number|3.23445]] xxx [[number|3.23445|5]]", e: "xxxx 3,234 xxx 3,23445"},
    {q: "xxxx [[number|3|2]] xxx [[number||2]]", e: "xxxx 3,00 xxx 0,00"},
    {q: "xxxx [[number|3.234|2]] xxx [[number|23412354.2|2]]", e: "xxxx 3,23 xxx 23.412.354,20"},
    {q: "xxxx [[number|example1]] xxx [[number|example2]]", e: "xxxx 12,34 xxx 17,343"},
    {q: "xxxx [[number|quatsch]] xxx [[number|quatsch]]", e: "xxxx 0 xxx 0"},
];

const testCasesTwo = [
    {q: "xxxx [[number]] xxx [[number]]", e: "xxxx 0,0 xxx 0,0"},
    {q: "xxxx [[number|5]] xxx [[number]]", e: "xxxx 5,0 xxx 0,0"},
    {q: "xxxx [[number|3.234]] xxx [[number]]", e: "xxxx 3,23 xxx 0,0"},
    {q: "xxxx [[number|3.23445]] xxx [[number|3.23445|5]]", e: "xxxx 3,23 xxx 3,23445"},
    {q: "xxxx [[number|3|2]] xxx [[number||2]]", e: "xxxx 3,00 xxx 0,00"},
    {q: "xxxx [[number|3.234|2]] xxx [[number|23412354.2|2]]", e: "xxxx 3,23 xxx 23.412.354,20"},
    {q: "xxxx [[number|example1]] xxx [[number|example2]]", e: "xxxx 12,34 xxx 17,34"},
];

const testOptions = {replace: {example1: 12.34, example2: 17.3433}};

describe("Currency Plugin", () => {
    let plugin: TranslatorPlugin;

    test("can parse [[number]] with forced locale", () => {
        plugin = createNumberPlugin("de-DE");
        testCasesOne.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator())).toBe(test.e);
        });
    });

    test("can parse [[number]] with locale from translator", () => {
        plugin = createNumberPlugin();
        testCasesOne.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator({default: "de-DE"}))).toBe(test.e);
        });
    });

    test("can parse [[number]] with options", () => {
        plugin = createNumberPlugin("de-DE", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 1,
        });
        testCasesTwo.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator())).toBe(test.e);
        });
    });
});

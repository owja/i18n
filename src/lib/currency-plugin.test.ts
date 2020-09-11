import {TranslatorPlugin, Translator} from "../";
import {createCurrencyPlugin} from "../plugins";

const testCases = [
    {q: "xxxx [[currency]] xxx [[currency]]", e: "xxxx 0,00 € xxx 0,00 €"},
    {q: "xxxx [[currency|5]] xxx [[currency]]", e: "xxxx 5,00 € xxx 0,00 €"},
    {q: "xxxx [[currency|3.234]] xxx [[currency]]", e: "xxxx 3,23 € xxx 0,00 €"},
    {q: "xxxx [[currency|3|USD]] xxx [[currency||]]", e: "xxxx 3,00 $ xxx 0,00 €"},
    {q: "xxxx [[currency|3.234]] xxx [[currency|12312341234|CNY]]", e: "xxxx 3,23 € xxx 12.312.341.234,00 CN¥"},
    {q: "xxxx [[currency|example1|USD]] xxx [[currency|example2]]", e: "xxxx 5,23 $ xxx 7,00 €"},
    {q: "xxxx [[currency|example3|USD]] xxx [[currency|example4]]", e: "xxxx 0,00 $ xxx 0,00 €"},
    {q: "xxxx [[currency|quatsch|USD]] xxx [[currency|quatsch]]", e: "xxxx 0,00 $ xxx 0,00 €"},
    {q: "xxxx [[currency|3,3quatsch|USD]] xxx [[currency|quatsch2]]", e: "xxxx 3,00 $ xxx 0,00 €"},
];

const testOptions = {replace: {example1: 5.234, example2: 7, example3: "bad", example4: new Date()}};

describe("Currency Plugin", () => {
    let plugin: TranslatorPlugin;

    test("can parse [[currency]] with forced locale", () => {
        plugin = createCurrencyPlugin("de-DE", "EUR");
        testCases.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator())).toBe(test.e);
        });
    });

    test("can parse [[currency]] with locale passed by translator", () => {
        plugin = createCurrencyPlugin(undefined, "EUR");
        testCases.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator({default: "de-DE"}))).toBe(test.e);
        });
    });

    test("can parse [[currency]] without currency (will use USD)", () => {
        plugin = createCurrencyPlugin();
        testCases.forEach((test) => {
            expect(plugin(test.q, testOptions, new Translator({default: "de-DE"}))).toBe(test.e.replace(/€/g, "$"));
        });
    });
});

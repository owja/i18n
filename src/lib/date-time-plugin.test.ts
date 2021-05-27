import {TranslatorPlugin, Translator} from "../";
import {createDateTimePlugin} from "../plugins";

describe("DateTime Plugin", () => {
    let plugin: TranslatorPlugin;

    test("can parse [[date]] with date passed by options", () => {
        plugin = createDateTimePlugin("de-DE", "UTC");
        [
            {q: "xxxx [[date|date]] xxx [[date|date]]", e: "xxxx 7.1.98 xxx 7.1.98"},
            {q: "xxxx [[date|date|medium]] xxx [[date|date|long]]", e: "xxxx 7. Jan. 1998 xxx 7. Januar 1998"},
            {
                q: "xxxx [[time|date|medium]] xxx [[time|date|long]] xxx [[time|date|short]]",
                e: "xxxx 16:30 xxx 16:30 UTC xxx 16:30",
            },
            {
                q: "xxxx [[time|date|medium|America/Inuvik]] xxx [[time|date|long|America/Inuvik]] xxx [[time|date|short|America/Inuvik]]",
                e: "xxxx 9:30 xxx 09:30 GMT-7 xxx 9:30",
            },
            {
                q: "xxxx [[time|date|long|Europe/Berlin]] xxx [[time|date|long|America/Inuvik]]",
                e: "xxxx 17:30 MEZ xxx 09:30 GMT-7",
            },
            {
                q: "xxxx [[date|date|extended]] xxx [[time|date|extended]]",
                e: "xxxx 7. Januar 1998 xxx 16:30 Koordinierte Weltzeit",
            },
            {
                q: "xxxx [[date|date|extended|America/Inuvik]] xxx [[time|date|extended|America/Inuvik]]",
                e: "xxxx 7. Januar 1998 xxx 09:30 Rocky Mountain-Normalzeit",
            },
            {
                q: "xxxx [[datetime|date|medium]] xxx [[datetime|date|medium|Europe/Berlin]]",
                e: "xxxx 7. Jan. 1998, 16:30 xxx 7. Jan. 1998, 17:30",
            },
        ].forEach((test) => {
            const date = new Date("1998-01-07T18:30:00+02:00");
            expect(plugin(test.q, {replace: {date}}, "en-US", new Translator())).toBe(test.e);
        });
    });

    test("can parse [[date]] with date passed by argument", () => {
        plugin = createDateTimePlugin("de-DE", "UTC");
        [
            {
                q: "xxxx [[date|1998-01-07T18:30:00+02:00]] xxx [[date|1998-01-07T18:30:00+02:00]]",
                e: "xxxx 7.1.98 xxx 7.1.98",
            },
            {
                q: "xxxx [[date|1998-01-07T18:30:00+02:00|medium]] xxx [[date|1998-01-07T18:30:00+02:00|long]]",
                e: "xxxx 7. Jan. 1998 xxx 7. Januar 1998",
            },
            {
                q: "xxxx [[time|1998-01-07T18:30:00+02:00|medium]] xxx [[time|1998-01-07T18:30:00+02:00|long]]",
                e: "xxxx 16:30 xxx 16:30 UTC",
            },
            {
                q: "xxxx [[time|1998-01-07T18:30:00+02:00|long|Europe/Berlin]] xxx [[time|1998-01-07T18:30:00+02:00|long|America/Inuvik]]",
                e: "xxxx 17:30 MEZ xxx 09:30 GMT-7",
            },
            {
                q: "xxxx [[date|1998-01-07T18:30:00+02:00|extended]] xxx [[time|1998-01-07T18:30:00+02:00|extended]]",
                e: "xxxx 7. Januar 1998 xxx 16:30 Koordinierte Weltzeit",
            },
            {
                q: "xxxx [[datetime|1998-01-07T18:30:00+02:00|medium]] xxx [[datetime|1998-01-07T18:30:00+02:00|medium|Europe/Berlin]]",
                e: "xxxx 7. Jan. 1998, 16:30 xxx 7. Jan. 1998, 17:30",
            },
        ].forEach((test) => {
            expect(plugin(test.q, {}, "en-US", new Translator())).toBe(test.e);
        });
    });

    test("can parse [[date]] without a date", () => {
        plugin = createDateTimePlugin("de-DE", "UTC");
        expect(plugin("xxxx [[date]] xxx [[date]]", {}, "en-US", new Translator())).not.toBe(
            "xxxx [[date]] xxx [[date]]",
        );
    });

    test("uses current locale", () => {
        plugin = createDateTimePlugin(undefined, "UTC");
        const date = new Date("1998-01-07T18:30:00+02:00");
        expect(
            plugin("xxxx [[date|date|medium]] xxx [[date|date|long]]", {replace: {date}}, "de-DE", new Translator()),
        ).toBe("xxxx 7. Jan. 1998 xxx 7. Januar 1998");
        expect(
            plugin("xxxx [[date|date|medium]] xxx [[date|date|long]]", {replace: {date}}, "en-US", new Translator()),
        ).toBe("xxxx Jan 7, 1998 xxx January 7, 1998");
    });
});

interface IValue {
    match: string;
    arguments: string[];
}

export default function(translated: string, find: string): IValue[] {
    const search = new RegExp("(\\[\\[(" + find + ")(\\|(.*?))?\\]\\])", "gm");
    const values: IValue[] = [];

    let m;
    while ((m = search.exec(translated)) !== null) {
        if (m.index === search.lastIndex) {
            search.lastIndex++;
        }

        values.push({
            match: m[0],
            arguments: m[4] !== undefined ? m[4].split("|") : [],
        });
    }

    return values;
}

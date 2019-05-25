declare module "*.json" {
    const json: {
        [prop: string]: string;
    };
    export = json;
}

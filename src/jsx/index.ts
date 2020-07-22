export { JsxApplication } from "./JsxApplication";
export { JsxController } from "./JsxController";
export { createElement } from "./createElement";

export interface IntrinsicElements {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
}

// TODO what is the right way to do this?
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [elemName: string]: any;
        }
    }
}

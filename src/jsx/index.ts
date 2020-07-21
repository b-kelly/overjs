export { JsxApplication } from "./JsxApplication";
export { JsxController } from "./JsxController";
export { createElement } from "./createElement";

export interface IntrinsicElements {
    [elemName: string]: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

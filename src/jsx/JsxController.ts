import { Controller } from "../core";
import { createElement, Component, render } from "./createElement";

export abstract class JsxController extends Controller implements Component {
    props: { [key: string]: unknown } = {};

    static get defaultProps(): { [key: string]: string } {
        return {
            js: this.domName(),
        };
    }

    constructor(); // no-param constructor for jsx rendering
    constructor(el: HTMLElement);
    constructor(el?: HTMLElement) {
        // TODO
        super(el ?? document.createElement("div"));
    }

    // TODO document
    connect(): void {
        // render the children
        const content = render(createElement("div", {}, this.content()));

        this.baseElement.append(...content);
    }

    // TODO
    render(): jsx.ComponentChildren {
        return null;
    }

    // TODO document
    protected abstract content(): jsx.ComponentChildren;

    /**
     * Translates a controller/component name string to the name you'd use to reference it in the dom
     * e.g. "TestSampleController", "TestSampleComponent", "TestSample" all become "test-sample"
     * @param name
     */
    public static getDomName(name: string): string {
        return Controller.getDomName(name)
            .replace(/-?component$/, "")
            .trim();
    }
}

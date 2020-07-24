import { Controller } from "../core";
import { createElement, Component } from "./createElement";

export abstract class JsxController extends Controller implements Component {
    props: { [key: string]: unknown } = {};

    static get defaultProps(): { [key: string]: string } {
        return {
            js: this.domName(),
        };
    }

    constructor(el: HTMLElement) {
        super(el);
    }

    // TODO document
    connect(): void {
        // render the children
        const content = createElement("div", {}, this.render());

        this.baseElement.append(...content.children);
    }

    // TODO document
    abstract render(): jsx.ComponentChildren;

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

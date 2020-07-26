import { Controller } from "../core";
import { createElement, Component, render, Fragment } from "./createElement";

export abstract class JsxController extends Controller implements Component {
    static defaultProps = {};

    private renderedProps: jsx.ComponentProps = {};

    constructor(); // no-param constructor for jsx rendering
    constructor(el: HTMLElement);
    constructor(el?: HTMLElement) {
        // TODO
        super(el ?? document.createElement("div"));
    }

    // TODO document
    connect(): void {
        // render the content
        const content = render(
            createElement(
                Fragment,
                this.renderedProps,
                this.content(this.renderedProps)
            )
        );

        this.baseElement.append(...content);
    }

    // TODO
    render(props: jsx.ComponentProps): jsx.ComponentChildren {
        this.renderedProps = props;
        return createElement("div", {
            js: JsxController.getDomName(this["constructor"].name),
        });
    }

    // TODO document
    protected abstract content(
        props: jsx.ComponentProps
    ): jsx.ComponentChildren;

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

import { Controller } from "../core";
import { createElement, Component, render, Fragment } from "./createElement";

export abstract class JsxController<P = Record<string, unknown>>
    extends Controller
    implements Component<P> {
    static defaultProps = {};

    props: P;

    constructor(props?: P); // props param constructor for jsx rendering
    constructor(el: HTMLElement);
    constructor(el?: HTMLElement, props?: P) {
        // TODO
        super(el ?? document.createElement("div"));
        this.props = props ?? <P>{};
    }

    // TODO document
    connect(): void {
        // render the content
        const content = render(
            createElement(Fragment, this.props, this.content(this.props))
        );

        this.baseElement.append(...content);
    }

    // TODO
    render(): jsx.ComponentChildren {
        return createElement("div", {
            js: JsxController.getDomName(this["constructor"].name),
        });
    }

    // TODO document
    protected abstract content(
        props: jsx.ComponentProps<P>
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

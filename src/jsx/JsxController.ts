import { Controller } from "../core";
import {
    createElement,
    Component,
    renderElements,
    Fragment,
} from "./createElement";

export abstract class JsxController<P = Record<string, unknown>>
    extends Controller
    implements Component<P>
{
    static defaultProps = {};
    /**
     * The "stored" props since jsx render and controller connection are completely
     * separate flows that cannot talk to eachother
     */
    private static storedProps: {
        [id: string]: jsx.ComponentProps<unknown>;
    } = {};

    props: jsx.ComponentProps<P>;
    /** The internal id of the component for looking up the stored props after render */
    private id: string;

    constructor(props?: jsx.ComponentProps<P>); // props param constructor for jsx rendering
    constructor(el: HTMLElement);
    constructor(input?: HTMLElement | jsx.ComponentProps<P>) {
        let el: HTMLElement | undefined;
        let props: jsx.ComponentProps<P> | undefined;

        if (input instanceof HTMLElement) {
            el = input;
        } else {
            props = input;
        }

        // TODO
        super(el ?? document.createElement("div"));
        this.props = props ?? <P>{};

        // generate this controller's unique id
        this.id =
            JsxController.getDomName(this.construct.name) +
            Math.random().toFixed(5);
    }

    // TODO document
    connect(): void {
        // get this instance's id that was stored on the element during jsx render
        const id = this.baseElement.getAttribute("data-props-id") ?? "";

        // get the props that were stored on the static member and delete them
        const props = JsxController.storedProps[id] ?? {};
        delete JsxController.storedProps[id];

        // set this component's props to the ones that were stored
        this.props = props as jsx.ComponentProps<P>;

        // render the content
        const content = renderElements(
            createElement(Fragment, this.props, this.content(this.props))
        );

        this.baseElement.append(...content);
    }

    // TODO
    render(): jsx.ComponentChildren {
        // elements are new'd up just for render, so we need to store the props somewhere
        // that the controller can access after Controller instantiation and connection
        JsxController.storedProps[this.id] = this.props;

        // render the base element with the `js=""` attribute (for dynamic hookup later)
        // and the current instance's stored props id
        return createElement("div", {
            js: JsxController.getDomName(this["constructor"].name),
            "data-props-id": this.id,
        });
    }

    // TODO document
    protected abstract content(
        props: jsx.ComponentProps<P>
    ): jsx.ComponentChildren;

    /**
     * Translates a controller/component name string to the name you'd use to reference it in the dom
     * e.g. "TestSampleController", "TestSampleComponent", "TestSampleControllerComponent", "TestSample" all become "test-sample"
     * @param name
     */
    public static getDomName(name: string): string {
        return Controller.getDomName(name)
            .replace(/(-?controller)?-?component(\b|$)/, "")
            .trim();
    }
}

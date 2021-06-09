/** Represents the different types of valid components that can be passed to a jsxFactor */
type ComponentType<P> =
    | string
    | ComponentConstructor<P>
    | ((props: jsx.ComponentProps<P>) => jsx.ComponentChildren);

/** Represents a constructable component */
export interface ComponentConstructor<P = Record<string, unknown>> {
    new (props?: P): Component<P>;
    // TODO We can't tell the difference between a class constructor
    // and a plain function without a property to key off of...
    defaultProps: Partial<P>;
}

/** Base class for creating a renderable JSX Class Component */
export abstract class Component<P = Record<string, unknown>> {
    static defaultProps = {};

    props: jsx.ComponentProps<P>;

    constructor(props?: P) {
        this.props = props ?? <P>{};
    }

    /**
     * Creates the renderable content for this component
     * @param props The props added to the component at render
     */
    abstract render(): jsx.ComponentChildren;
}

/**
 * Represents a JSX fragment which is a "transparent" element that is used like <>children</>;
 * This method is a valid target for tsconfig's compilerOptions.jsxFragmentFactory
 */
export class Fragment<P = unknown> extends Component<P> {
    render(): jsx.ComponentChildren {
        return this.props?.children;
    }
}

/** Represents a "rendered" JSX element */
export type JsxNode<P> = {
    type: ComponentType<P>;
    props: jsx.ComponentProps<P>;
};

/**
 * Creates a JsxNode from a valid JSX input;
 * This method is a valid target for tsconfig's compilerOptions.jsxFactory
 * @param type The type of the element to create
 * @param props The properties to add to the element
 * @param children The children of the element
 */
export function createElement<P>(
    type: ComponentType<P>,
    props: P | null,
    ...children: jsx.ComponentChildren[]
): JsxNode<P> {
    const newProps = <JsxNode<P>["props"]>{
        children: children as jsx.ComponentChildren,
    };

    // don't blindly pass props through, sanitize it first
    if (props) {
        for (const propName in props) {
            if (
                propName !== "children" &&
                Object.hasOwnProperty.call(props, propName) //TODO necessary? alternatives?
            ) {
                newProps[propName] = props[propName];
            }
        }
    }

    // add in the values of "defaultProps"
    if (type instanceof Function && "defaultProps" in type) {
        const defaultProps = type.defaultProps;
        for (const propName in defaultProps) {
            const defaultProp = defaultProps[propName];
            if (newProps[propName] === undefined && defaultProp !== undefined) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error TODO despite the undefined guard, it still complains about assigning an undefined value
                newProps[propName] = defaultProp;
            }
        }
    }

    return {
        type,
        props: newProps,
    };
}

/**
 * Renders a JsxNode into an array of DOM nodes
 * @param node The node to render
 */
export function renderElements<P>(node: JsxNode<P>): Node[] {
    let rootElement: Node;

    if (!node) {
        return [];
    }

    if (typeof node.type === "string") {
        rootElement = document.createElement(node.type);
        render(node.props.children, rootElement);
    } else if ("defaultProps" in node.type) {
        const prerenderedNode = createElement(
            "div",
            {},
            new node.type(node.props).render()
        );
        rootElement = renderElements(prerenderedNode)[0];
    } else {
        const prerenderedNode = createElement("div", {}, node.type(node.props));
        rootElement = renderElements(prerenderedNode)[0];
    }

    if (rootElement as Element) {
        const el = rootElement as Element;
        Object.keys(node.props).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error TODO ComponentProps is not-indexable
            const val = node.props[key] as unknown;

            if (!val) {
                return;
            }

            if (key === "children") {
                return;
            }

            if (key === "className") {
                key = "class";
            }

            // if dangerouslySetInnerHTML.__html is set, then set the innerHTML... dangerously
            if (
                key === "dangerouslySetInnerHTML" &&
                (val as { __html: string })
            ) {
                el.innerHTML = (val as { __html: string }).__html;
                return;
            }

            // boolean props just set the attribute w/ no value
            if (val === true) {
                el.setAttribute(key, "");
            } else if (String(val)) {
                el.setAttribute(key, String(val));
            }
        });
    }

    return typeof node.type === "string"
        ? [rootElement]
        : Array.from(rootElement.childNodes);
}

/**
 * Appends all child components into the root node
 * @param child The children to append
 * @param container The node to add all the components to
 */
const render = function (child: jsx.ComponentChildren, container: Node) {
    const rootEl = container as Element;

    if (!rootEl) {
        return;
    }

    let el: Node[] = [];

    if (child === null || child === undefined || typeof child === "boolean") {
        return;
    }

    if (typeof child !== "object") {
        el.push(document.createTextNode(child.toString()));
    } else if (child instanceof Array) {
        child.forEach((c) => render(c, rootEl));
    } else if ("props" in child) {
        el = renderElements(child);
    } else {
        /* object */
        el.push(document.createTextNode(child.toString()));
    }

    if (!el.length) {
        return;
    }

    rootEl.append(...el);
};

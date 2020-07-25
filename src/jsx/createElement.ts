/** Represents the different types of valid components that can be passed to a jsxFactor */
type ComponentType =
    | string
    | ComponentConstructor
    | ((props: jsx.ComponentProps) => jsx.ComponentChildren);

/** Represents a constructable component */
export interface ComponentConstructor {
    new (): Component;
    // TODO We can't tell the difference between a class constructor
    // and a plain function without a property to key off of...
    isComponent: boolean;
}

/** Base class for creating a renderable JSX Class Component */
export abstract class Component {
    static isComponent = true;
    /**
     * Creates the renderable content for this component
     * @param props The props added to the component at render
     */
    abstract render(props?: jsx.ComponentProps): jsx.ComponentChildren;
}

/**
 * Represents a JSX fragment which is a "transparent" element that is used like <>children</>;
 * This method is a valid target for tsconfig's compilerOptions.jsxFragmentFactory
 */
export function Fragment(props: jsx.ComponentProps): jsx.ComponentChildren {
    return props.children;
}

/** Represents a "rendered" JSX element */
export interface JsxNode {
    type: ComponentType;
    props: jsx.Props & { children: jsx.ComponentChildren };
}

/**
 * Creates a JsxNode from a valid JSX input;
 * This method is a valid target for tsconfig's compilerOptions.jsxFactory
 * @param type The type of the element to create
 * @param props The properties to add to the element
 * @param children The children of the element
 */
export function createElement(
    type: ComponentType,
    props: jsx.Props | null,
    ...children: jsx.ComponentChildren[]
): JsxNode {
    const p = props ? { ...props, children } : { children };

    return {
        type,
        props: p,
    };
}

/**
 * Renders a JsxNode into an array of DOM nodes
 * @param node The node to render
 */
export function render(node: JsxNode): Node[] {
    let rootElement: Node;

    if (typeof node.type === "string") {
        rootElement = document.createElement(node.type);

        appendChildren(rootElement, node.props.children);
    } else if ("isComponent" in node.type) {
        const prerenderedNode = createElement(
            "div",
            node.props,
            new node.type().render(node.props)
        );
        rootElement = render(prerenderedNode)[0];
    } else {
        const prerenderedNode = createElement(
            "div",
            node.props,
            node.type(node.props)
        );
        rootElement = render(prerenderedNode)[0];
    }

    if (rootElement as Element) {
        const el = rootElement as Element;
        Object.keys(node.props).forEach((key) => {
            const val: unknown = node.props[key];

            if (!val) {
                return;
            }

            if (key === "children") {
                return;
            }

            if (key === "className") {
                key = "class";
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
 * @param root The node to add all the components to
 * @param child The children to append
 */
const appendChildren = function (root: Node, child: jsx.ComponentChildren) {
    const rootEl = root as Element;

    if (!rootEl) {
        return;
    }

    let el: Node[] = [];

    if (child === null || child === undefined) {
        return;
    }

    if (typeof child !== "object") {
        el.push(document.createTextNode(child.toString()));
    } else if (child instanceof Array) {
        child.forEach((c) => appendChildren(rootEl, c));
    } else if ("props" in child) {
        el = render(child);
    } else {
        throw `Unable to append invalid child: ` + child.toString();
    }

    if (!el.length) {
        return;
    }

    rootEl.append(...el);
};

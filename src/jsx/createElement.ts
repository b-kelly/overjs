type ComponentType =
    | ComponentConstructor
    | ((props: ComponentProps) => jsx.ComponentChildren);

// TODO document
export interface ComponentConstructor {
    new (): Component;
    // TODO Can't tell the difference between a class constructor and a plain function
    // without a property to key off of...
    isComponent: boolean;
}

type Props = { [key: string]: unknown };
export type ComponentProps = Props & {
    readonly children?: jsx.ComponentChildren;
};

// TODO document
export abstract class Component {
    static isComponent = true;
    abstract render(props?: ComponentProps): jsx.ComponentChildren;
}

// TODO document
export function Fragment(props: ComponentProps): jsx.ComponentChildren {
    return props.children;
}

export interface JsxNode {
    type: string | ComponentType;
    props: Props & { children: jsx.ComponentChildren };
}

// TODO document
export function createElement(
    type: string | ComponentType,
    props: Props | null,
    ...children: jsx.ComponentChildren[]
): JsxNode {
    const p = props ? { ...props, children } : { children };

    return {
        type,
        props: p,
    };
}

// TODO document
export function render(node: JsxNode): Node[] {
    let rootElement: Element;

    if (typeof node.type === "string") {
        rootElement = document.createElement(node.type);

        appendChildren(rootElement, node.props.children);
    } else if ("isComponent" in node.type) {
        const prerenderedNode = createElement(
            "div",
            node.props,
            new node.type().render(node.props)
        );
        rootElement = render(prerenderedNode)[0] as Element;
    } else {
        const prerenderedNode = createElement(
            "div",
            node.props,
            node.type(node.props)
        );
        rootElement = render(prerenderedNode)[0] as Element;
    }

    if (rootElement) {
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
                rootElement.setAttribute(key, "");
            } else if (String(val)) {
                // TODO are we leaving out anything important?
                rootElement.setAttribute(key, String(val));
            }
        });
    }

    return typeof node.type === "string"
        ? [rootElement]
        : Array.from(rootElement.childNodes);
}

const appendChildren = function (root: Element, child: jsx.ComponentChildren) {
    let el: Node[] = [];

    if (child === null || child === undefined) {
        return;
    }

    if (typeof child !== "object") {
        el.push(document.createTextNode(child.toString()));
    } else if (child instanceof Array) {
        child.forEach((c) => appendChildren(root, c));
    } else if ("props" in child) {
        // TODO
        el = render(child);
    } else {
        throw "TODO Don't know what to do here... check this in tests later.";
    }

    if (!el.length) {
        return;
    }

    root.append(...el);
};

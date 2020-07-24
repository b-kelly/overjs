type ComponentType<T extends Props> =
    | ComponentConstructor<T>
    | ((props: ComponentProps<Props>) => jsx.ComponentChildren);

// TODO document
export interface ComponentConstructor<T extends Props> {
    new (): Component<T>;
    // TODO! Can't tell the difference between a class and a function without something like this...
    isComponent: boolean;
}

type Props = { [key: string]: unknown };
export type ComponentProps<T extends Props = Props> = T & {
    readonly children?: jsx.ComponentChildren;
};

// TODO document
export abstract class Component<T extends Props = Props> {
    static isComponent = true;
    abstract render(props?: ComponentProps<T>): jsx.ComponentChildren;
}

// TODO document
export function Fragment(props: ComponentProps<Props>): jsx.ComponentChildren {
    return props.children;
}

export interface JsxNode<T extends Props> {
    type: string | ComponentType<T>;
    props: T & { children: jsx.ComponentChildren };
}

// TODO document
export function createElement<T extends Props>(
    type: string | ComponentType<T>,
    props: T | null,
    ...children: jsx.ComponentChildren[]
): JsxNode<T> {
    // @ts-ignore
    const p: JsxNode<T>["props"] = props ?? {};
    p.children = children;

    return {
        type,
        props: p,
    };
}

export function render<T extends Props>(node: JsxNode<T>): Node[] {
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

            if (key === "children") {
                return;
            }

            if (key === "className") {
                key = "class";
            }

            // boolean props just set the attribute w/ no value
            if (val === true) {
                rootElement.setAttribute(key, "");
            } else if (typeof val === "string") {
                // TODO are we leaving out anything important?
                rootElement.setAttribute(key, val);
            }
        });
    }

    return node.type !== Fragment
        ? [rootElement]
        : Array.from(rootElement.childNodes);
}

const appendChildren = function (root: Element, child: jsx.ComponentChildren) {
    let el: Node[] = [];

    if (!child) {
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

type ComponentType<T extends Props> =
    | ComponentConstructor<T>
    | (() => jsx.ComponentChildren);

// TODO document
export interface ComponentConstructor<T extends Props> {
    new (props: T): Component<T>;
    defaultProps: Partial<T>;
}

type Props = { [key: string]: any };
type ComponentProps<T extends Props> = T & {
    readonly children?: jsx.ComponentChildren;
};

// TODO document
export abstract class Component<T extends Props = Props> {
    props: ComponentProps<T>;
    static defaultProps: Partial<Props> = {};

    constructor(props: T) {
        this.props = props;
    }

    abstract render(props?: ComponentProps<T>): jsx.ComponentChildren;
}

// TODO document
export class Fragment extends Component {
    render(props?: ComponentProps<Props>): jsx.ComponentChildren {
        return props?.children;
    }
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

export function render<T extends Props>(node: JsxNode<T>): Element[] {
    let rootElement: Element;

    if (typeof node.type === "string") {
        rootElement = document.createElement(node.type);

        appendChildren(rootElement, node.props.children);
    } else if ("defaultProps" in node.type) {
        // TODO add children in place without wrapping div?
        const prerenderedNode = createElement(
            "div",
            {
                ...node.props,
                ...node.type.defaultProps,
            },
            new node.type(node.props).render(node.props)
        );
        rootElement = render(prerenderedNode)[0];
    } else {
        // TODO add children in place without wrapping div?
        const prerenderedNode = createElement("div", node.props, node.type());
        // TODO
        rootElement = render(prerenderedNode)[0];
    }

    if (node.props) {
        Object.keys(node.props).forEach((key) => {
            const val: any = node.props[key];
            // boolean props just set the attribute w/ no value
            if (val === true) {
                rootElement.setAttribute(key, "");
            } else if (val) {
                rootElement.setAttribute(key, val);
            }
        });
    }

    return [rootElement];
}

const appendChildren = function (root: Node, child: jsx.ComponentChildren) {
    let el: Node | null = null;

    if (!child) {
        return;
    }

    if (typeof child !== "object") {
        el = document.createTextNode(child.toString());
    } else if (child instanceof Array) {
        child.forEach((c) => appendChildren(root, c));
    } else if ("props" in child) {
        // TODO
        el = render(child)[0];
    } else {
        throw "TODO Don't know what to do here... check this in tests later.";
    }

    if (!(el instanceof Node)) {
        return;
    }

    root.appendChild(el);
};

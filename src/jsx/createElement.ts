// TODO!
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
type ComponentType<T extends Component> =
    | ComponentConstructor<T>
    | (() => jsx.ComponentChildren);

// TODO document
export interface ComponentConstructor<T extends Component> {
    new (): T;
    defaultProps: { [key: string]: unknown };
}

// TODO document
export abstract class Component {
    props: { [key: string]: unknown } = {};
    static defaultProps: { [key: string]: unknown } = {};
    abstract render(): jsx.ComponentChildren;
}

// TODO document
export class Fragment extends Component {
    render(): jsx.ComponentChildren {
        return null;
    }
}

// TODO document
export function createElement<T extends Component>(
    type: string | ComponentType<T>,
    props: { [key: string]: any } | null,
    ...children: jsx.ComponentChildren[]
): Element {
    let rootElement: Element;

    if (typeof type === "string") {
        rootElement = document.createElement(type);
    } else if ("defaultProps" in type) {
        // TODO add children in place without wrapping div?
        rootElement = createElement(
            "div",
            {
                ...props,
                ...type.defaultProps,
            },
            new type().render()
        );
    } else {
        // TODO add children in place without wrapping div?
        rootElement = createElement("div", props, type());
    }

    if (props) {
        Object.keys(props).forEach((key) => {
            const val: any = props[key];
            // boolean props just set the attribute w/ no value
            if (val === true) {
                rootElement.setAttribute(key, "");
            } else if (val) {
                rootElement.setAttribute(key, val);
            }
        });
    }

    children.forEach((c: jsx.ComponentChildren) => {
        appendChildNode(rootElement, c);
    });

    return rootElement;
}

const appendChildNode = function (root: Node, child: any) {
    let el: Node | null = null;

    if (typeof child === "string") {
        el = document.createTextNode(child);
    } else if (child instanceof Node) {
        el = child;
    } else if (child instanceof Array) {
        child.forEach((c: string | Node) => appendChildNode(root, c));
    }

    if (!(el instanceof Node)) {
        return;
    }

    root.appendChild(el);
};

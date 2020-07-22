import { JsxController } from "./JsxController";

//TODO docs
export function createElement(
    type: string | JsxController,
    props: { [key: string]: any } | null,
    ...children: any[]
): Element {
    let rootElement: Element;

    if (typeof type === "string") {
        rootElement = document.createElement(type);
    } else {
        rootElement = type.render();
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

    children.forEach((c: any) => {
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

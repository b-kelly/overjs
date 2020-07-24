import { Application, Controller } from "../core";
import { Component } from "./JsxController";
import { createElement } from "./createElement";

export class JsxApplication extends Application {
    private selector: string;

    constructor(selector: string) {
        super();

        this.selector = selector;
    }

    // TODO document
    start(): Promise<void> {
        return super.start().then(() => {
            const root = document.querySelector<HTMLElement>(this.selector);

            if (!root) {
                throw (
                    "Cannot initialize application without a root element: " +
                    this.selector
                );
            }

            this.render(root);
        });
    }

    // TODO document
    render(root: HTMLElement): void {
        const nodeName = root.nodeName;
        const controllerName = Controller.getDomName(nodeName);
        root.setAttribute("js", controllerName);
        const controller = this.getControllerForElement(
            root,
            controllerName
        ) as Component;

        if (!controller) {
            return;
        }

        const content = createElement(typeof controller, {});
        root.appendChild(content);
    }
}

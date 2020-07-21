import { Application, Controller } from "../core";
import { JsxController } from "./JsxController";

export class JsxApplication extends Application {
    private selector: string;

    constructor(selector: string) {
        super();

        this.selector = selector;
    }

    // TODO document
    start(callback: () => void | null = null) {
        super.start(() => {
            const root = document.querySelector<HTMLElement>(this.selector);
            this.render(root);

            if (callback) {
                callback();
            }
        });
    }

    // TODO document
    render(root: HTMLElement) {
        const nodeName = root.nodeName;
        const controllerName = Controller.getDomName(nodeName);
        root.setAttribute("js", controllerName);
        const controller = this.getControllerForElement(
            root,
            controllerName
        ) as JsxController;

        if (!controller) {
            return;
        }

        const content = controller.render();
        root.appendChild(content);
    }
}

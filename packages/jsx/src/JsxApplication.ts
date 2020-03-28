import { Application, Controller } from "@overjs/core";
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
            let root = document.querySelector<HTMLElement>(this.selector);
            this.render(root);

            if (callback) {
                callback();
            }
        });
    }

    // TODO document
    render(root: HTMLElement) {
        let nodeName = root.nodeName;
        let controllerName = Controller.getDomName(nodeName);
        root.setAttribute('ov', controllerName);
        let controller = this.getControllerForElement(root, controllerName) as JsxController;

        if (!controller) {
            return;
        }

        let content = controller.render();
        root.appendChild(content);
    }
}
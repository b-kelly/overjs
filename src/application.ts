import { Controller } from "./controller";

export class Application {

    /**
     * Contains a mapping of all registered controllers
     */
    private registeredControllers = new Map<string, typeof Controller>();

    private controllerInstances: Controller[] = [];

    start() {
        this.domReady(e => {
            this.hookup();
        });
    }

    register(controller: typeof Controller) {
        this.registeredControllers.set(controller.name, controller);
    }

    /**
     * TODO hooks up the dom; ideally this will add a mutation observer, but we're not there yet
     */
    private hookup() {
        // TODO this only works on first call, let's add an observer and repeatedly enhance added elements
        // TODO should we use `ov="CONTROLLER"` or `data-controller="CONTROLLER"`?
        document.querySelectorAll('[ov]').forEach((el: HTMLElement) => this.enhance(el));
    }

    /**
     * Progressively enhances an html element with it's designated controller
     * @param el the element to enhace; must have an attribute `ov="[CONTROLLER]"`
     */
    private enhance(el: HTMLElement) {
        let controllerName = el.getAttribute('ov');

        if (!this.registeredControllers.has(controllerName)) {
            // TODO should we throw/log here?
            return;
        }

        let controller = this.registeredControllers.get(controllerName);

        let instance = new controller(el);

        // TODO start/hookup the instance lifecycle

        this.controllerInstances.push(instance);
    }

    /**
     * Calls the callback when the dom is ready for interaction
     * @param callback the function to call when the dom is ready
     */
    private domReady (callback: (e: Event) => void) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        }
        else {
            callback(null);
        }
    }
}
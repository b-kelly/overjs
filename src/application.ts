import { Controller, BindingMap, Binding } from "./controller";

export class Application {
    private controllerHandlers = new Map<string, ControllerManager>();

    start() {
        this.domReady(e => {
            this.hookup();
        });
    }

    register(controller: typeof Controller) {
        // changes a controller from "TestSampleController" to "test-sample"
        var simplifiedName = controller.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/-?controller$/, '').trim();

        if (!simplifiedName) {
            throw 'Unable to initialize controller with bad name: ' + controller.name;
        }

        this.controllerHandlers.set(simplifiedName, new ControllerManager(controller));
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

        if (!this.controllerHandlers.has(controllerName)) {
            // TODO should we throw/log here?
            return;
        }

        let handler = this.controllerHandlers.get(controllerName);

        // tell the handler to hook up a new instance of the controller to this element
        handler.construct(el);
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

class ControllerManager {
    private controllerType: typeof Controller;
    private instances: { controller: Controller, bindings: InternalBindingMap }[] = [];

    constructor(type: typeof Controller) {
        this.controllerType = type;
    }

    construct(el: HTMLElement) {
        let controller = new this.controllerType(el);
        let instance = {
            controller: controller,
            bindings: new InternalBindingMap(controller, this.controllerType.bindings)
        };

        this.instances.push(instance);

        controller.construct();

        // TODO fire when connected to the dom
        controller.connect();

        // TODO also fire on dom change
        this.bindTargetEvents(instance.controller, instance.bindings);
    }

    /**
     * binds all targets
     * TODO needs to bind targets selectively on mutation
     */
    private bindTargetEvents(controller: Controller, bindings: InternalBindingMap) {
        // TODO get targets that were mutated
        let targets = controller.baseElement.querySelectorAll<HTMLElement>('[ov-target]');

        if (!targets.length) {
            return;
        }

        // bind each targets' event to the bound function
        targets.forEach((t: HTMLElement) => {
            let target = t.getAttribute('ov-target');
            let binding = bindings.get(target);

            if (!binding) {
                return;
            }

            t.addEventListener(binding[0], binding[1]);
        });
    }

    private unbindTargets(controller: Controller, bindings: InternalBindingMap) {
        controller.baseElement.querySelectorAll<HTMLElement>('[ov-target]').forEach(t => {
            let target = t.getAttribute('ov-target');
            let binding = bindings.get(target);

            t.removeEventListener(binding[0], binding[1]);
        });
    }
}

class InternalBindingMap {
    private targets: BindingMap = {};

    constructor(caller: Controller, bindings: BindingMap) {
        this.bind(caller, bindings);
    }

    /**
     * TODO document
     */
    private bind(caller: Controller, bindings: BindingMap) {
        Object.keys(bindings).forEach(k => {
            var bindingSet = bindings[k];
            // make sure the function call is bound to the caller so `this` is correct
            this.targets[k] = [bindingSet[0], bindingSet[1].bind(caller)];
        });
    }

    /**
     * TODO document
     * @param target
     */
    get(target: string): Binding {
        return this.targets[target];
    }
}
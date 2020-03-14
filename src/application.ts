import { Controller, BindingMap, Binding, HelperMap } from "./controller";

export class Application {
    private controllerHandlers = new Map<string, ControllerManager>();
    private observer: MutationObserver;
    private registeredHelpers: { [name: string]: (element: HTMLElement, data?: any) => any } = {};

    get helpers() {
        return { ...this.registeredHelpers };
    }

    start() {
        this.domReady(e => {
            this.hookup();
        });
    }

    register(controller: typeof Controller) {
        // changes a controller from "TestSampleController" to "test-sample"
        var simplifiedName = controller.getDomName();

        if (!simplifiedName) {
            throw 'Unable to initialize controller with bad name: ' + controller.name;
        }

        this.controllerHandlers.set(simplifiedName, new ControllerManager(controller));
        this.registerHelpers(simplifiedName, controller.helpers);
    }

    destroy() {
        this.observer?.disconnect();
        this.controllerHandlers.forEach(h => h.destroy());
        this.controllerHandlers.clear();
    }

    getControllerForElement(element: HTMLElement, controller: string) {
        return this.controllerHandlers.get(controller).findInstanceForElement(element).controller;
    }

    private registerHelpers(simplifiedName: string, helpers: HelperMap) { //TODO
        Object.keys(helpers).forEach(key => {
            this.registeredHelpers[key] = (element: HTMLElement, data: any) => {
                let controller = this.getControllerForElement(element, simplifiedName);

                if (!controller) {
                    throw 'Unable to find ' + simplifiedName + ' controller for element';
                }

                return helpers[key](controller, data);
            };
        });
    }

    /**
     * TODO hooks up the dom; ideally this will add a mutation observer, but we're not there yet
     */
    private hookup() {
        this.observer = new MutationObserver(this.mutate.bind(this));

        // observe the document for changes
        this.observer.observe(document, {
            attributes: true,
            childList: true,
            subtree: true
        });

        // go ahead and enhance the elements that are already on the page
        // TODO should we use `ov="CONTROLLER"` or `data-controller="CONTROLLER"`?
        document.querySelectorAll('[ov]').forEach((el: HTMLElement) => this.enhanceElement(el));
    }

    private mutate(mutations: MutationRecord[], observer: MutationObserver) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                // handle removes first since we could be replacing an element
                this.handleRemovedElements(mutation.removedNodes);
                this.handleAddedElements(mutation.addedNodes);
            }
            else if (mutation.type === 'attributes') {
                this.handleAttributeChange(mutation.target);
            }
        });
    }

    private handleAddedElements(nodes: NodeList) {
        nodes.forEach((n: HTMLElement) => {
            this.handleAddedElement(n);
        });
    }

    private handleAddedElement(n: HTMLElement) {
        // we don't operate on text nodes, nothing to enhance!
        if (n.nodeType === Node.TEXT_NODE) {
            return;
        }

        this.enhanceElement(n);
    }

    private handleRemovedElements(nodes: NodeList) {
        nodes.forEach((n: HTMLElement) => {
            this.handleRemovedElement(n);
        });
    }

    private handleRemovedElement(n: HTMLElement) {
        // we don't operate on text nodes, nothing to enhance!
        if (n.nodeType === Node.TEXT_NODE) {
            return;
        }

        this.degradeElement(n);
    }

    private handleAttributeChange(node: Node) {
        // TODO
    }

    private enhanceElement(el: HTMLElement) {
        var handler = this.getHandlerForElement(el);

        if (!handler[0]) {
            // TODO should we throw here?
            return;
        }

        if (el.hasAttribute('ov')) {
            // tell the handler to hook up a new instance of the controller to this element
            handler[0].construct(el);
        }
        else if (el.hasAttribute('ov-target')) {
            handler[0].connectControllerChild(handler[1], el);
        }
        else {
            let controllers = el.querySelectorAll<HTMLElement>('[ov]');
            controllers.forEach(c => this.enhanceElement(c));

            let targets = el.querySelectorAll<HTMLElement>(':not([ov]) [ov-target]');
            targets.forEach(t => this.enhanceElement(t));
        }
    }

    /**
     * Degrades an html element
     * @param el the element to degrade
     */
    private degradeElement(el: HTMLElement) {
        var handler = this.getHandlerForElement(el);

        if (!handler[0]) {
            // TODO should we throw here?
            return;
        }

        if (el.hasAttribute('ov')) {
            handler[0].disconnectElement(el);
        }
        else if (el.hasAttribute('ov-target')) {
            handler[0].disconnectControllerChild(handler[1], el);
        }
        else {
            let controllers = el.querySelectorAll<HTMLElement>('[ov]');
            controllers.forEach(c => this.degradeElement(c));

            let targets = el.querySelectorAll<HTMLElement>(':not([ov]) [ov-target]');
            targets.forEach(t => this.degradeElement(t));
        }
    }

    private getHandlerForElement(el: HTMLElement): [ControllerManager, HTMLElement] {
        let parentController = el.closest('[ov]') as HTMLElement;
        if (!parentController) {
            // TODO should we throw?
            return null;
        }

        let controllerName = parentController.getAttribute('ov');

        if (!this.controllerHandlers.has(controllerName)) {
            return null;
        }

        let controller = this.controllerHandlers.get(controllerName);

        return [controller, parentController];
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

type ControllerInstance = { controller: Controller, bindings: InternalBindingMap };

class ControllerManager {
    private controllerType: typeof Controller;
    private instances: ControllerInstance[] = [];

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

        // TODO also fire on dom change
        this.bindTargetEvents(instance.controller, instance.bindings, controller.baseElement);

        // TODO fire when connected to the dom
        controller.connect();
    }

    connectControllerChild(controllerElement: HTMLElement, childElement: HTMLElement) {
        let instance = this.findInstanceForElement(controllerElement);

        if (!instance) {
            // TODO throw?
            return;
        }

        this.bindTargetEvents(instance.controller, instance.bindings, childElement);
    }

    disconnectElement(el: HTMLElement) {
        let instance = this.findInstanceForElement(el);

        if (!instance) {
            // TODO throw?
            return;
        }

        // remove the instance from the saved instances
        var index = this.instances.indexOf(instance); //TODO we can do better... save in loop?
        this.instances.splice(index, 1);

        // disconnect the controller from the element
        this.disconnectInstance(instance);
    }

    disconnectControllerChild(controllerElement: HTMLElement, childElement: HTMLElement) {
        let instance = this.findInstanceForElement(controllerElement);

        if (!instance) {
            // TODO throw?
            return;
        }

        this.unbindTargets(instance.controller, instance.bindings, childElement);
    }

    destroy() {
        this.instances.forEach(i => {
            this.disconnectInstance(i);
        });

        this.instances = [];
    }

    findInstanceForElement(baseElement: HTMLElement) {
        let instance: ControllerInstance;

        // TODO we can do better than scanning every controller...
        for (let i of this.instances) {
            if (i.controller.baseElement.isEqualNode(baseElement)) {
                instance = i;
                break;
            }
        }

        return instance;
    }

    private disconnectInstance(instance: ControllerInstance) {
        this.unbindTargets(instance.controller, instance.bindings, instance.controller.baseElement);
        instance.controller.disconnect();
    }

    /**
     * binds all targets
     * TODO needs to bind targets selectively on mutation
     */
    private bindTargetEvents(controller: Controller, bindings: InternalBindingMap, el: HTMLElement) {
        let targets = Array.from(el.querySelectorAll<HTMLElement>('[ov-target]'));

        // if the base element is a target, initialize it too
        if (el.hasAttribute('ov-target')) {
            targets.push(el);
        }

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

    private unbindTargets(controller: Controller, bindings: InternalBindingMap, el: HTMLElement) {
        let targets = Array.from(el.querySelectorAll<HTMLElement>('[ov-target]'));

        // if the base element is a target, initialize it too
        if (el.hasAttribute('ov-target')) {
            targets.push(el);
        }

        targets.forEach(t => {
            let target = t.getAttribute('ov-target');
            let binding = bindings.get(target);

            if (!binding) {
                // this target isn't bound, so nothing to unbind
                return;
            }

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

            // wrap the bound function so that if it returns true/undefined, then prevent default
            let boundFunction = (e: Event) => {
                // make sure the function call is bound to the caller so `this` is correct
                var result = bindingSet[1].bind(caller)(e);
                if (result || typeof result === 'undefined') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            this.targets[k] = [bindingSet[0], boundFunction];
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
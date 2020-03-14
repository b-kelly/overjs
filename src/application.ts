import { Controller, BindingMap, Binding } from "./controller";

export class Application {
    private controllerHandlers = new Map<string, ControllerManager>();
    private observer: MutationObserver;

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
    }

    destroy() {
        this.observer?.disconnect();
        this.controllerHandlers.forEach(h => h.destroy());
        this.controllerHandlers.clear();
    }

    getControllerForElement(element: HTMLElement, controller: string) {
        return this.controllerHandlers.get(controller).findInstanceForElement(element).controller;
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
        document.querySelectorAll('[ov]').forEach((el: HTMLElement) => this.enhance(el));
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
            // we don't operate on text nodes, nothing to enhance!
            if (n.nodeType === Node.TEXT_NODE) {
                return;
            }

            // newly added controller! Enhance!
            if (n.hasAttribute('ov')) {
                this.enhance(n);
            }
            // hookup the target events
            else {
                this.enhanceChild(n);
            }
        });
    }

    private handleRemovedElements(nodes: NodeList) {
        nodes.forEach((n: HTMLElement) => {
            // we don't operate on text nodes, nothing to enhance!
            if (n.nodeType === Node.TEXT_NODE) {
                return;
            }

            // removed controller! Degrade!
            if (n.hasAttribute('ov')) {
                this.degrade(n);
            }
            // disconnect the target events
            else {
                this.degradeChild(n);
            }
        });
    }

    private handleAttributeChange(node: Node) {
        // TODO
    }

    /**
     * Progressively enhances an html element with its designated controller
     * @param el the element to enhace; must have an attribute `ov="[CONTROLLER]"`
     */
    private enhance(el: HTMLElement) {
        var handler = this.getHandlerForControllerElement(el);

        if (!handler) {
            // TODO should we throw here?
            return;
        }

        // tell the handler to hook up a new instance of the controller to this element
        handler.construct(el);
    }

    private enhanceChild(el: HTMLElement) {
        var handler = this.getHandlerForChildElement(el);

        if (!handler) {
            // TODO should we throw here?
            return;
        }

        handler[0].connectControllerChild(handler[1], el);
    }

    /**
     * Degrades an html element and disconnects its controller
     * @param el the element to degrade; must have an attribute `ov="[CONTROLLER]"`
     */
    private degrade(el: HTMLElement) {
        var handler = this.getHandlerForControllerElement(el);

        if (!handler) {
            // TODO should we throw here?
            return;
        }

        handler.disconnectElement(el);
    }

    private degradeChild(el: HTMLElement) {
        var handler = this.getHandlerForChildElement(el);

        if (!handler) {
            // TODO should we throw here?
            return;
        }

        handler[0].disconnectControllerChild(handler[1], el);
    }

    private getHandlerForControllerElement(el: HTMLElement) {
        let controllerName = el.getAttribute('ov');

        if (!this.controllerHandlers.has(controllerName)) {
            return null;
        }

        return this.controllerHandlers.get(controllerName);
    }

    private getHandlerForChildElement(el: HTMLElement): [ControllerManager, HTMLElement] {
        let parentController = el.closest('[ov]') as HTMLElement;
        if (!parentController) {
            // TODO should we throw?
            return null;
        }

        return [this.getHandlerForControllerElement(parentController), parentController];
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
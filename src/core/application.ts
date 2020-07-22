import { Controller, BindingMap, Binding, HelperMap } from "./controller";
import { Observer } from "./observer";

export class Application {
    private controllerHandlers = new Map<string, ControllerManager>();
    private observer?: Observer;
    private registeredHelpers: {
        [name: string]: (element: HTMLElement, data?: any) => any;
    } = {};
    private started = false;

    get helpers(): Readonly<Application["registeredHelpers"]> {
        return { ...this.registeredHelpers };
    }

    /**
     * Instructs the application to start dom observation and hook up all registered controllers
     */
    start(): Promise<void> {
        return this.domReady().then(() => {
            this.hookup();
            this.started = true;
        });
    }

    /**
     * Registers a controller with this application, which connects its helpers and allows it to be hooked up to the dom
     * @param controller The controller class to register with this application instance
     */
    register(controller: typeof Controller): void {
        if (this.started) {
            throw "Unable to register a controller after the application has been started";
        }

        // changes a controller from "TestSampleController" to "test-sample"
        const simplifiedName = controller.domName();

        if (!simplifiedName) {
            throw (
                "Unable to initialize controller with bad name: " +
                controller.name
            );
        }

        this.controllerHandlers.set(
            simplifiedName,
            new ControllerManager(controller)
        );
        this.registerHelpers(simplifiedName, controller.helpers);
    }

    /**
     * Destroys the application by instructing it to cease dom observation and destroy all existing controller instances
     */
    destroy(): void {
        this.observer?.disconnect();
        this.controllerHandlers.forEach((h) => h.destroy());
        this.controllerHandlers.clear();
    }

    /**
     * Gets the controller instance for a given dom element
     * @param element The element to fetch the controller for
     * @param controller The simplified name of the controller
     */
    getControllerForElement(element: HTMLElement, controller: string): Controller | null {
        const handler = this.controllerHandlers.get(controller);

        // the given controller is not registered with this application
        if (!handler) {
            return null;
        }

        const instance = handler.findInstanceForElement(element);

        // no specific instance registered for the given element
        if (!instance || !instance.controller) {
            return null;
        }

        return instance.controller;
    }

    /**
     * Registers a controller's helpers to this application
     * @param simplifiedName The name of the controller whose helpers are being registered
     * @param helpers The map of all helpers on this controller
     */
    private registerHelpers(simplifiedName: string, helpers: HelperMap) {
        // loop through each passed helper and register
        Object.keys(helpers).forEach((key) => {
            // create a function that does the heavy lifting of getting the controller from the passed element
            // binding to the controller and then calling the helper on it, passing along all the necessary data
            const boundHelper = (element: HTMLElement, data: any) => {
                const controller = this.getControllerForElement(
                    element,
                    simplifiedName
                );

                if (!controller) {
                    throw (
                        "Unable to find " +
                        simplifiedName +
                        " controller for element"
                    );
                }

                // TODO fix this! Looking at it, this is likely a bug?
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                return helpers[key](controller, data).bind(controller);
            };

            this.registeredHelpers[key] = boundHelper;
        });
    }

    /**
     * Builds and starts the dom observer, then prompts it to immediately connect all controllers
     */
    private hookup() {
        this.observer = new Observer(document.documentElement, {
            additionDelegate: this.enhanceElement.bind(this),
            removalDelegate: this.degradeElement.bind(this),
            attributeChangeDelegate: this.handleAttributeChange.bind(this),
            getApplicableElements: Application.getApplicableElements,
        });
        this.observer.connect();

        // go ahead and enhance the elements that are already on the page
        this.observer.refresh();
    }

    /**
     * Gets all elements within the given element that are applicable for being hooked up
     * @param element The element to search in for applicable elements
     */
    private static getApplicableElements(element: Element) {
        return element.querySelectorAll<HTMLElement>(
            `[js], :not([js]) [js-target]`
        );
    }

    /**
     * Enhances an element and all applicable descendant elements
     * @param el The element (and its decendants) to enhance
     */
    private enhanceElement(node: Node) {
        const el = node as HTMLElement;

        // we only operate on non-text html elements
        if (!el || el.nodeType === Node.TEXT_NODE) {
            return;
        }

        const handler = this.getHandlerForElement(el);

        if (!handler || !handler[0]) {
            // TODO should we throw here?
            return;
        }

        if (el.hasAttribute("js")) {
            // tell the handler to hook up a new instance of the controller to this element
            // NOTE: this will automatically enhance all descendants, so no need to do so again
            handler[0].construct(el);
        } else if (el.hasAttribute("js-target")) {
            // ehances up a single applicable non-root element
            handler[0].connectControllerChild(handler[1], el);
        } else {
            // get all applicable descendants and enhance them
            const elements = Application.getApplicableElements(el);
            elements.forEach((e) => this.enhanceElement(e));
        }
    }

    /**
     * Degrades an html element and all applicable descendant elements
     * @param el The element to degrade
     */
    private degradeElement(node: Node) {
        const el = node as HTMLElement;

        // we only operate on non-text html elements
        if (!el || el.nodeType === Node.TEXT_NODE) {
            return;
        }

        const handler = this.getHandlerForElement(el);

        if (!handler || !handler[0]) {
            // TODO should we throw here?
            return;
        }

        if (el.hasAttribute("js")) {
            // tell the handler to degrade the root instance on this element
            // NOTE: this will automatically degrade all descendants, so no need to do so again
            handler[0].disconnectElement(el);
        } else if (el.hasAttribute("js-target")) {
            // degrade a specific non-root element
            handler[0].disconnectControllerChild(handler[1], el);
        } else {
            // get all applicable descendants and degrade them
            const elements = Application.getApplicableElements(el);
            elements.forEach((e) => this.degradeElement(e));
        }
    }

    private handleAttributeChange(
        el: HTMLElement,
        attributeName: string,
        oldValue: string
    ) {
        const newValue = el.getAttribute(attributeName);
        if (attributeName === "js") {
            if (oldValue && oldValue !== newValue) {
                //this.degradeElement(el); TODO!

                if (newValue) {
                    this.enhanceElement(el);
                }
            } else if (!oldValue && newValue) {
                this.enhanceElement(el);
            }
        } else if (attributeName == "js-target") {
            //TODO!
        }
    }

    /**
     * Gets the handler for a given element along with its parent controller
     * @param el The element to fetch the handler for
     */
    private getHandlerForElement(
        el: HTMLElement
    ): [ControllerManager, HTMLElement] | null {
        // attempt to find the closest controller element
        // NOTE: this includes the given element itself as well
        const parentController = el.closest<HTMLElement>("[js]");
        if (!parentController) {
            // TODO should we throw?
            return null;
        }

        // this will *never* return null, but add a coalesce to satisfy the strict null compiler check
        const controllerName = parentController.getAttribute("js") ?? "";

        // if this controller is not registered, then there's nothing to do
        if (!this.controllerHandlers.has(controllerName)) {
            return null;
        }

        const controller = this.controllerHandlers.get(controllerName);

        if (!controller) {
            return null;
        }

        return [controller, parentController];
    }

    /**
     * Calls the callback when the dom is ready for interaction
     * @param callback the function to call when the dom is ready
     */
    private domReady() {
        return new Promise((resolve) => {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => resolve());
            } else {
                resolve();
            }
        });
    }
}

type ControllerInstance = {
    controller: Controller;
    bindings: InternalBindingMap;
};

/**
 * Helper construct that manages all instances of a single controller type
 */
class ControllerManager {
    private controllerType: typeof Controller;
    private instances: ControllerInstance[] = [];

    constructor(type: typeof Controller) {
        this.controllerType = type;
    }

    /**
     * Constructs and connects a new instance of a controller to the given element
     * @param el The element to connect the newly created controller to
     */
    construct(el: HTMLElement) {
        if (!el) {
            throw "Unable to connect a controller to a non-existent element";
        }

        // create a new controller of our stored type with this element as the baseElement
        const controller = new this.controllerType(el);
        const instance = {
            controller: controller,
            bindings: new InternalBindingMap(
                controller,
                this.controllerType.bindings
            ),
        };

        // add the newly added controller to our stored instances
        this.instances.push(instance);

        // start the controller lifecycle by calling construct
        controller.construct();

        // bind the controller
        this.bindTargetEvents(instance.bindings, controller.baseElement);

        controller.connect();
    }

    /**
     * Connects up a non-root controller element
     * @param controllerElement The base controller element this child belongs to
     * @param childElement The child to connect
     */
    connectControllerChild(
        controllerElement: HTMLElement,
        childElement: HTMLElement
    ) {
        const instance = this.findInstanceForElement(controllerElement);

        if (!instance) {
            // TODO throw?
            return;
        }

        // bind the child element based on the instance bindings
        this.bindTargetEvents(instance.bindings, childElement);
    }

    /**
     * Disconnects an existing controller instance from the given element and removes it from this manager
     * @param el
     */
    disconnectElement(el: HTMLElement) {
        const instance = this.findInstanceForElement(el);

        if (!instance) {
            // TODO throw?
            return;
        }

        // remove the instance from the saved instances
        const index = this.instances.indexOf(instance);
        this.instances.splice(index, 1);

        // disconnect the controller from the element
        this.disconnectInstance(instance);
    }

    /**
     * Disconnects a non-root element from its root controller
     * @param controllerElement The base controller element this child belongs to
     * @param childElement The child to disconnect
     */
    disconnectControllerChild(
        controllerElement: HTMLElement,
        childElement: HTMLElement
    ) {
        const instance = this.findInstanceForElement(controllerElement);

        if (!instance) {
            // TODO throw?
            return;
        }

        // disconnect all bindings from the child element
        this.unbindTargets(instance.bindings, childElement);
    }

    /**
     * Destroys all instances within this manager by disconnecting each of them, then disposing of them
     */
    destroy() {
        this.instances.forEach((i) => {
            this.disconnectInstance(i);
        });

        this.instances = [];
    }

    /**
     * Gets the ControllerInstance for a given element from this manager
     * @param baseElement The element to fetch the controller instance from
     */
    findInstanceForElement(baseElement: HTMLElement) {
        let instance: ControllerInstance | null = null;

        // TODO can we do better than this?
        // scan through every created instance and check if the passed element is the same as the instance's baseElement
        for (const i of this.instances) {
            if (i.controller.baseElement.isEqualNode(baseElement)) {
                instance = i;
                break;
            }
        }

        return instance;
    }

    /**
     * Disconnects an instance from an element by unbinding it and all descendants and calling the controller's disconnect lifecycle function
     * @param instance The instance to disconnect
     */
    private disconnectInstance(instance: ControllerInstance) {
        this.unbindTargets(instance.bindings, instance.controller.baseElement);
        instance.controller.disconnect();
    }

    /**
     * Binds all target events to this element and its descendants
     * @param bindings The bindings to bind to this element
     * @param el The element (and its descendants) to bind to
     */
    private bindTargetEvents(bindings: InternalBindingMap, el: HTMLElement) {
        // get all the bindable elements from this element's decendants
        const targets = Array.from(
            el.querySelectorAll<HTMLElement>("[js-target]")
        );

        // if the base element is a target, initialize it too
        if (el.hasAttribute("js-target")) {
            targets.push(el);
        }

        // nothing to bind means nothing to do... return early
        if (!targets.length) {
            return;
        }

        // bind each targets' event to the bound function
        targets.forEach((t: HTMLElement) => {
            // this will *never* return null, but add a coalesce to satisfy the strict null compiler check
            const target = t.getAttribute("js-target") ?? "";
            const binding = bindings.get(target);

            // if there is no event binding for this target, skip it
            if (!binding) {
                return;
            }

            // add the event listener to this element based on the binding
            t.addEventListener(binding[0], binding[1]);
        });
    }

    /**
     * Unbinds all target events on this element and its descendants
     * @param bindings The bindings to unbind on this element
     * @param el The element (and its descendants) to unbind
     */
    private unbindTargets(bindings: InternalBindingMap, el: HTMLElement) {
        // get all the bindable elements from this element's decendants
        const targets = Array.from(
            el.querySelectorAll<HTMLElement>("[js-target]")
        );

        // if the base element is a target, initialize it too
        if (el.hasAttribute("js-target")) {
            targets.push(el);
        }

        // unbind each targets' event
        targets.forEach((t) => {
            // this will *never* return null, but add a coalesce to satisfy the strict null compiler check
            const target = t.getAttribute("js-target") ?? "";
            const binding = bindings.get(target);

            // this target isn't bound, so nothing to unbind
            if (!binding) {
                return;
            }

            // remove the previously bound event listener based on the binding
            t.removeEventListener(binding[0], binding[1]);
        });
    }
}

/**
 * Helper class that creates and manages all bound functions for a given controller type
 */
class InternalBindingMap {
    private targets: BindingMap = {};

    constructor(caller: Controller, bindings: BindingMap) {
        this.bind(caller, bindings);
    }

    /**
     * Binds every static binding on a controller type on a per instance basis, along with wrapping to preventDefault/stopPropagation by default
     * @param caller The calling controller to bind to
     * @param bindings The controller's bindings
     */
    private bind(caller: Controller, bindings: BindingMap) {
        Object.keys(bindings).forEach((k) => {
            const bindingSet = bindings[k];

            // wrap the bound function so that if it returns true/undefined, then prevent default
            const boundFunction = (e: Event) => {
                // make sure the function call is bound to the caller so `this` is correct
                const result = bindingSet[1].bind(caller)(e);
                if (result || typeof result === "undefined") {
                    e.preventDefault();
                    e.stopPropagation();
                }

                return result;
            };

            // saves this pre-bound function for easy retrieval / unbinding
            this.targets[k] = [bindingSet[0], boundFunction];
        });
    }

    /**
     * Gets a saved bound function by its target key
     * @param target The target key to retrieve
     */
    get(target: string): Binding {
        return this.targets[target];
    }
}

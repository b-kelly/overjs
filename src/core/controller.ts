export class Controller {
    /**
     * A map of all the bindings attached to a controller's targets, keyed on the target name
     */
    static bindings: BindingMap = {};

    /**
     * A map of all the helper functions this controller exposes, keyed on the exposed helper's name
     */
    static helpers: HelperMap = {};

    /**
     * The base element this controller is attached to
     */
    readonly baseElement: HTMLElement;

    /**
     * Map of all events this controller has dynamically bound to the document via bindDocumentEvent
     */
    private boundDocumentMethods: { [key: string]: EventListener } = {};

    constructor(el: HTMLElement) {
        this.baseElement = el;
    }

    /**
     * Lifecyle method that is called immediately after the controller instance has been constructed
     */
    construct(): void {
        // Override in extending class
    }

    /**
     * Lifecycle method that is called after a controller has been completely connected
     */
    connect(): void {
        // Override in extending class
    }

    /**
     * Lifecycle method that is called after a controller has been disconnected
     */
    disconnect(): void {
        // Override in extending class
    }

    /**
     * The data allocated to this controller via data-* attributes on the base element
     */
    protected get data(): DOMStringMap {
        return this.baseElement.dataset;
    }

    /**
     * Returns the first element for the given target
     * @param target The target to fetch
     */
    protected target(target: string): HTMLElement {
        return this.baseElement.querySelector<HTMLElement>(
            `[js-target="${target}"]`
        );
    }

    /**
     * Returns all elements for the given target
     * @param target The targets to fetch
     */
    protected targets(target: string): NodeListOf<HTMLElement> {
        return this.baseElement.querySelectorAll<HTMLElement>(
            `[js-target="${target}"]`
        );
    }

    /**
     * Triggers an event on this controller's baseElement with the event name prefixed with the controller's simple name
     * @param eventName The name of the event to fire which will be prefixed as `controller-name:eventName`
     * @param detail The event detail object to attach to the custom event
     * @param optionalElement An element to fire the event on rather than the baseElement
     */
    protected triggerEvent<T>(
        eventName: string,
        detail?: T,
        optionalElement?: Element
    ): CustomEvent<T> {
        const namespacedName =
            Controller.getDomName(this["constructor"].name) + ":" + eventName;
        const event: CustomEvent<T> = new CustomEvent(namespacedName, {
            bubbles: true,
            cancelable: true,
            detail: detail,
        });
        (optionalElement || this.baseElement).dispatchEvent(event);
        return event;
    }

    /**
     * Cleanly binds an event to the document in a way that can be easily unbound later
     * @param eventType The type of event to bind
     * @param key The unique key to reference this event for unbinding later
     * @param listener The event listener for this event
     */
    protected bindDocumentEvent(
        eventType: string,
        key: string,
        listener: EventListener
    ): void {
        const boundFunction =
            this.boundDocumentMethods[key] || listener.bind(this);

        this.boundDocumentMethods[key] = boundFunction;

        document.addEventListener(eventType, boundFunction);
    }

    /**
     * Unbinds a previously bound document event
     * @param eventType The type of event to unbind
     * @param key The unique key used when binding this event originally
     */
    protected unbindDocumentEvent(eventType: string, key: string): void {
        const boundFunction = this.boundDocumentMethods[key];

        if (!boundFunction) {
            return;
        }

        document.removeEventListener(eventType, boundFunction);
        delete this.boundDocumentMethods[key];
    }

    /**
     * Translates this controller's name to the name you'd use to reference it in the dom
     * eg "TestSampleController" becomes "test-controller"
     */
    public static domName(): string {
        return this.getDomName(this.name);
    }

    /**
     * Translates a controller name string to the name you'd use to reference it in the dom
     * eg "TestSampleController" becomes "test-controller"
     * @param name
     */
    public static getDomName(name: string): string {
        return name
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .toLowerCase()
            .replace(/-?controller$/, "")
            .trim();
    }
}

/**
 * Describes the shape of a controller helper function
 */
export type Helper = (instance: Controller, data?: any) => any;

/**
 * Describes the shape of a controller binding value
 */
export type Binding = [
    keyof HTMLElementEventMap,
    (this: Controller, evt: Event) => void
];

/**
 * Describes the shape of all the helper functions on a controller
 */
export interface HelperMap {
    [helperName: string]: Helper;
}

/**
 * Describes the shape of all bindings on a controller
 */
export interface BindingMap {
    [targetName: string]: Binding;
}

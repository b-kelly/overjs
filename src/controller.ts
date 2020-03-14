export class Controller {
    static bindings: BindingMap = {};
    
    baseElement: HTMLElement;
    protected boundMethods: {[key: string]: EventListener } = { };

    constructor(el: HTMLElement) {
        this.baseElement = el;
    }

    construct() {
        // Override in extending class
    }

    connect() {
        // Override in extending class
    }

    disconnect() {
        // Override in extending class
    }

    protected get data() {
        return this.baseElement.dataset;
    }

    protected target(target: string) {
        return this.baseElement.querySelector(`[ov-target="${target}"]`);
    }

    protected targets(target: string) {
        return this.baseElement.querySelectorAll(`[ov-target="${target}"]`);
    }

    protected triggerEvent<T>(eventName: string, detail?: T, optionalElement?: Element) {
        const namespacedName = Controller._getDomName(this['constructor'].name) + ':' + eventName;
        var event : CustomEvent<T> = new CustomEvent(namespacedName, {bubbles: true, cancelable: true, detail: detail});
        (optionalElement || this.baseElement).dispatchEvent(event);
        return event;
    }

    protected bindDocumentEvent(eventType: string, key: string, listener: EventListener) {
        let boundFunction = this.boundMethods[key] || listener.bind(this);

        this.boundMethods[key] = boundFunction;

        document.addEventListener(eventType, boundFunction);
    }

    protected unbindDocumentEvent(eventType: string, key: string) {
        let boundFunction = this.boundMethods[key];

        if (!boundFunction) {
            return;
        }

        document.removeEventListener(eventType, boundFunction);
        delete this.boundMethods[key];
    }

    /**
     * Translates this controller name to the name you'd use to reference it in the dom
     * eg "TestSampleController" becomes "test-controller"
     */
    public static getDomName() {
        return this._getDomName(this.name);
    }

    private static _getDomName(name: string) {
        return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/-?controller$/, '').trim();
    }
}

export type Binding = [keyof HTMLElementEventMap, EventListener];

export interface BindingMap {
    [key: string]: Binding
}
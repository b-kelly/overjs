export class Controller {
    static bindings: BindingMap = {};
    
    baseElement: HTMLElement;

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

    target(target: string) {
        return this.baseElement.querySelector(`[ov-target="${target}"]`);
    }

    targets(target: string) {
        return this.baseElement.querySelectorAll(`[ov-target="${target}"]`);
    }

    /**
     * Translates this controller name to the name you'd use to reference it in the dom
     * eg "TestSampleController" becomes "test-controller"
     */
    public static getDomName() {
        return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/-?controller$/, '').trim();
    }
}

export type Binding = [keyof HTMLElementEventMap, EventListener];

export interface BindingMap {
    [key: string]: Binding
}
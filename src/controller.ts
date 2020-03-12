export class Controller {
    static bindings: BindingMap = {};  //TODO this should likely be static
    
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
}

export type Binding = [keyof HTMLElementEventMap, EventListener];

export interface BindingMap {
    [key: string]: Binding
}
import { Controller } from "../core";
import { createElement } from "./createElement";

export abstract class Component extends Controller {
    constructor(el: HTMLElement) {
        super(el);
    }

    props: any = {};

    // TODO document
    connect(): void {
        // render the children
        const content = createElement("div", {}, this.render());

        this.baseElement.append(...content.children);
    }

    // TODO needs to return jsx.JSX.Element
    // TODO document
    abstract render(): jsx.ComponentChildren;
}

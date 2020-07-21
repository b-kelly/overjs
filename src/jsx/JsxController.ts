import { Controller } from "../core";

export abstract class JsxController extends Controller {

    constructor(el: HTMLElement) {
        super(el);
    }

    // TODO document
    connect() {
        let content = this.render();
        this.baseElement.appendChild(content);
    }

    // TODO document
    abstract render(): Element;
}
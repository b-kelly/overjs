import { Controller } from "../../src/index";

export class SampleController extends Controller {
    constructor(el: HTMLElement) {
        super(el);

        var sample = document.createElement('div');
        sample.textContent = 'Hello world!';
        el.appendChild(sample);
    }
}
import { Controller } from "@overjs/core";

export let sample = `
<div js="test-sample"></div>
`;

export class TestSampleController extends Controller {
    constructor(el: HTMLElement) {
        super(el);

        var sample = document.createElement('div');
        sample.textContent = 'Hello world!';
        el.appendChild(sample);
    }
}
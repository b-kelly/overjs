import { Controller } from "../../src/index";

export let sample = `
<div ov="test-sample"></div>
`;

export class TestSampleController extends Controller {
    constructor(el: HTMLElement) {
        super(el);

        var sample = document.createElement('div');
        sample.textContent = 'Hello world!';
        el.appendChild(sample);
    }
}
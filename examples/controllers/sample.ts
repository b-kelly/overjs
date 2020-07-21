import { Controller } from "../../src/core";

export const sample = `
<div js="test-sample"></div>
`;

export class TestSampleController extends Controller {
    constructor(el: HTMLElement) {
        super(el);

        const sample = document.createElement("div");
        sample.textContent = "Hello world!";
        el.appendChild(sample);
    }
}

import { Controller } from "../../src/index";
import { TestSampleController, sample as TestSampleSample } from "./sample";
import { Binding } from "../../src/controller";

const types = new Map([
    [TestSampleController, TestSampleSample]
]);

export class ControllerListController extends Controller {
    static bindings = {
        'template':  ['click', ControllerListController.logOnClick] as Binding //TODO need to get rid of `as Binding`, get rid of prefix
    };

    private test = Math.random();

    construct() {
        this.baseElement.innerHTML = this.generateList();
    }

    private generateList() {
        return `
        <ul>
            ${Array.from(types).map(i => this.generateItem(i[0])).join()}
        </ul>
        `;
    }

    private generateItem(item: typeof Controller) {
        return `<li><a href="#" ov-target="template">${item.name}</a></li>`;
    }

    private static logOnClick(this: ControllerListController, e: Event) { //TODO get rid of 'this:'?
        e.stopPropagation();
        e.preventDefault();

        console.log(this.test);
        return false;
    }
}
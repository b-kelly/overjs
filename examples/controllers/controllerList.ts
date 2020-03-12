import { Controller } from "../../src/index";
import { TestSampleController, sample as TestSampleSample } from "./sample";
import { Binding } from "../../src/controller";

type Mapping = [typeof Controller, string];

const types = new Map([
    [TestSampleController.name, [TestSampleController, TestSampleSample] as Mapping]
]);

export class ControllerListController extends Controller {
    static bindings = {
        'template':  ['click', ControllerListController.logOnClick] as Binding //TODO need to get rid of `as Binding`, get rid of prefix
    };

    connect() {
        this.baseElement.innerHTML = `
            ${this.generateList()}
            <div ov-target="demo"></div>
        `;
    }

    private generateList() {
        return `
        <ul>
            ${Array.from(types).map(i => `<li><a href="#" ov-target="template">${i[1][0].name}</a></li>`).join()}
        </ul>
        `;
    }

    private static logOnClick(this: ControllerListController, e: Event) { //TODO get rid of 'this:'?
        var controller = (<HTMLElement>e.target).textContent;
        var mapping = types.get(controller);

        var container = this.target('demo');
        container.innerHTML = mapping[1];
    }
}
import { Controller, Binding } from "@overjs/core";
import { TestSampleController, sample as TestSampleSample } from "./sample";
import { ModalController, sample as ModalSample } from "./modal";
import { PopoverController, sample as PopoverSample } from "./popover";

type Mapping = [typeof Controller, string];

const types = new Map([
    [TestSampleController.name, [TestSampleController, TestSampleSample] as Mapping],
    [ModalController.name, [ModalController, ModalSample] as Mapping],
    [PopoverController.name, [PopoverController, PopoverSample] as Mapping]
]);

export class ControllerListController extends Controller {
    static bindings = {
        'template':  ['click', ControllerListController.logOnClick] as Binding //TODO need to get rid of `as Binding`, get rid of prefix
    };

    connect() {
        this.baseElement.innerHTML = `
            ${this.generateList()}
            <div ov-target="demo"></div>
            <textarea ov-target="markup" readonly class="w50" style="height: 512px;"></textarea>
        `;
    }

    private generateList() {
        return `
        <ul>
            ${Array.from(types).map(i => `<li><a href="#" ov-target="template">${i[1][0].name}</a></li>`).join('')}
        </ul>
        `;
    }

    private static logOnClick(this: ControllerListController, e: Event) { //TODO get rid of 'this:'?
        var controller = (<HTMLElement>e.target).textContent;
        var mapping = types.get(controller);

        var container = this.target('demo');
        container.innerHTML = mapping[1];

        var markup = <HTMLTextAreaElement>this.target('markup');
        markup.value = mapping[1];
    }
}
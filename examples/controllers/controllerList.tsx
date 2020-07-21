import { Controller, Binding } from "../../src/core";
import { TestSampleController, sample as TestSampleSample } from "./sample";
import { ModalController, sample as ModalSample } from "./modal";
import { PopoverController, sample as PopoverSample } from "./popover";
import * as oJSX from "../../src/jsx";

type Mapping = [typeof Controller, string];

const types = new Map([
    [
        TestSampleController.name,
        [TestSampleController, TestSampleSample] as Mapping,
    ],
    [ModalController.name, [ModalController, ModalSample] as Mapping],
    [PopoverController.name, [PopoverController, PopoverSample] as Mapping],
]);

export class ControllerListController extends oJSX.JsxController {
    static bindings = {
        template: ["click", ControllerListController.logOnClick] as Binding, //TODO need to get rid of `as Binding`, get rid of prefix
    };

    render() {
        return (
            <div>
                <ul>
                    {Array.from(types).map((i) => (
                        <li>
                            <a href="#" js-target="template">
                                {i[1][0].name}
                            </a>
                        </li>
                    ))}
                </ul>
                <div js-target="demo"></div>
                <textarea js-target="markup"></textarea>
            </div>
        );
    }

    private static logOnClick(this: ControllerListController, e: Event) {
        //TODO get rid of 'this:'?
        var controller = (e.target as HTMLElement).textContent;
        var mapping = types.get(controller);

        var container = this.target("demo");
        container.innerHTML = mapping[1];

        var markup = this.target("markup") as HTMLTextAreaElement;
        markup.value = mapping[1];
    }
}

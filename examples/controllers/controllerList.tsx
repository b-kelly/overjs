import { Controller, BindingMap } from "../../src/core";
import { TestSampleController } from "./sample";
import { ModalController, sample as ModalSample } from "./modal";
import { PopoverController, sample as PopoverSample } from "./popover";
import jsx from "../../src/jsx";
import { JsxController } from "../../src/jsx/JsxController";

type Mapping = [typeof Controller, string];

const types = new Map([
    [ModalController.name, [ModalController, ModalSample] as Mapping],
    [PopoverController.name, [PopoverController, PopoverSample] as Mapping],
]);

export class ControllerListController extends JsxController {
    static bindings: BindingMap = {
        template: ["click", ControllerListController.logOnClick],
    };

    // TODO needs to return the right type
    render(): jsx.ComponentChildren {
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
                    <li>
                        <TestSampleController />
                    </li>
                </ul>
                <div js-target="demo"></div>
                <textarea js-target="markup"></textarea>
            </div>
        );
    }

    private static logOnClick(this: ControllerListController, e: Event) {
        //TODO get rid of 'this:'?
        const controller = (e.target as HTMLElement).textContent;

        if (!controller) {
            return;
        }

        const mapping = types.get(controller);

        if (!mapping) {
            return;
        }

        const container = this.target("demo");

        container.innerHTML = mapping[1];

        const markup = this.target("markup") as HTMLTextAreaElement;
        markup.value = mapping[1];
    }
}

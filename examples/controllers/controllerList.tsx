import { BindingMap } from "../../src/core";
import jsx from "../../src/jsx";
import { ComponentConstructor } from "../../src/jsx/createElement";
import { ModalController, sample as ModalSample } from "./modal";
import { PopoverController, sample as PopoverSample } from "./popover";
import { TestSampleController } from "./sample";

const types = new Map<string, string | ComponentConstructor>([
    [ModalController.name, ModalSample],
    [PopoverController.name, PopoverSample],
    [TestSampleController.name, TestSampleController],
]);

export class ControllerListController extends jsx.JsxController {
    static bindings: BindingMap = {
        template: ["click", ControllerListController.logOnClick],
    };

    content(): jsx.ComponentChildren {
        return (
            <>
                <ul>
                    {Array.from(types).map((i) => (
                        <li>
                            <a href="#" js-target="template">
                                {i[0]}
                            </a>
                        </li>
                    ))}
                </ul>
                <div js-target="demo"></div>
                <textarea js-target="markup"></textarea>
            </>
        );
    }

    private static logOnClick(this: ControllerListController, e: Event) {
        const controllerName = (e.target as HTMLElement).textContent;

        if (!controllerName) {
            return;
        }

        const mapping = types.get(controllerName);

        if (!mapping) {
            return;
        }

        const container = this.target("demo");

        container.innerHTML = "";

        if (typeof mapping === "string") {
            container.innerHTML = mapping;
        } else {
            const renderedElement = jsx.render(jsx.createElement(mapping, {}));
            container.append(...renderedElement);
        }

        const markup = this.target("markup") as HTMLTextAreaElement;
        markup.value = container.innerHTML;
    }
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestSampleController } from "./controllers/sample";
import { ControllerListController } from "./controllers/controllerList";
import { ModalController } from "./controllers/modal";
import { PopoverController } from "./controllers/popover";

import "@stackoverflow/stacks/dist/css/stacks.min.css";
import { Application } from "../src";

const app = new Application();
app.register(TestSampleController);
app.register(ControllerListController);
app.register(ModalController);
app.register(PopoverController);

void app.start().then(() => {
    //TODO expose better
    // @ts-ignore;
    window.helpers = app.helpers;
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    window.helpers[
        "getControllerForElement"
    ] = app.getControllerForElement.bind(app);

    document
        .querySelector(".js-disconnect-all")
        ?.addEventListener("click", () => {
            app.destroy();
        });
});

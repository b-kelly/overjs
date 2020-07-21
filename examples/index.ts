import { JsxApplication } from "../src/jsx";
import { TestSampleController } from "./controllers/sample";
import { ControllerListController } from "./controllers/controllerList";
import { ModalController } from "./controllers/modal";
import { PopoverController } from "./controllers/popover";

import "@stackoverflow/stacks/dist/css/stacks.min.css";

var app = new JsxApplication("controller-list");
app.register(TestSampleController);
app.register(ControllerListController);
app.register(ModalController);
app.register(PopoverController);

app.start();

//TODO expose better
// @ts-ignore;
window.helpers = app.helpers;
//@ts-ignore
window.helpers["getControllerForElement"] = app.getControllerForElement.bind(
    app
);

document.querySelector(".js-disconnect-all").addEventListener("click", (e) => {
    app.destroy();
});

console.log("hello docs!");

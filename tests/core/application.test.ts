import { Application } from "../../src/core";
import { TestController } from "../test-helpers/TestController";

function addElement(id: string, controller = "test") {
    const el = document.createElement("div");
    el.innerHTML = "uninitialized";
    el.setAttribute("js", controller);
    el.setAttribute("id", id);

    document.body.appendChild(el);

    return el;
}

async function createAndStartApp(): Promise<Application> {
    const app = new Application();
    app.register(TestController);
    await app.start();

    return app;
}

/** Hack that forces the test to wait a bit for the MutationObserver to kick in */
function waitForMutation() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

describe("Application", () => {
    it("should create an observer on start and remove on destroy", async () => {
        const el1 = addElement("el1");
        expect(el1.innerHTML).toBe("uninitialized");

        const app = await createAndStartApp();

        // existing elements should be connected
        expect(el1.innerHTML).toBe("connected");

        // new elements are connected at insert
        const el2 = addElement("el2");
        await waitForMutation();
        expect(el2.innerHTML).toBe("connected");

        // expect elements to disconnect on destroy
        app.destroy();
        expect(el1.innerHTML).toBe("disconnected");
        expect(el2.innerHTML).toBe("disconnected");

        // expect new elements to not connect at all
        const el3 = addElement("el3");
        expect(el3.innerHTML).toBe("uninitialized");
    });

    it("should return unique controller instances from getControllerForElement", async () => {
        const el1 = addElement("el1");
        const el2 = addElement("el2");
        const el3 = addElement("el3", "fake");
        const app = await createAndStartApp();

        const controller1 = app.getControllerForElement(el1, "test");
        const controller2 = app.getControllerForElement(el2, "test");
        const controller3 = app.getControllerForElement(el3, "test");

        expect(controller1).toBeDefined();
        expect(controller2).toBeDefined();
        expect(controller1).not.toBe(controller2);
        expect(controller3).toBeNull();
    });

    it("should have registered helpers", async () => {
        const el1 = addElement("el1");
        const app = await createAndStartApp();

        // the helpers from TestController should be added to app.helpers
        expect(app.helpers).toHaveProperty(TestController.helpers.setKey.name);

        // call the helper and check that it ran on the correct instance
        const randomKey = `${Math.random()}`;
        app.helpers.setKey(el1, randomKey);
        const controller = app.getControllerForElement(
            el1,
            "test"
        ) as TestController;
        expect(controller?.key).toBe(randomKey);
    });
});

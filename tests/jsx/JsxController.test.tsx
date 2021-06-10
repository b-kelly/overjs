import jsx from "../../src/jsx";
import { Application } from "../../src";

class TestControllerComponent extends jsx.JsxController {
    content(): jsx.ComponentChildren {
        return <div className="js-render-target">{this.props.children}</div>;
    }
}

function renderControllerComponent() {
    return (
        <TestControllerComponent>
            <a href="#">childA</a>
            <a href="#">childB</a>
        </TestControllerComponent>
    );
}

/** Hack that forces the test to wait a bit for the MutationObserver to kick in */
function waitForMutation() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

describe("JsxController", () => {
    it("should render content with props", async () => {
        const app = new Application();
        app.register(TestControllerComponent);
        await app.start();

        const rendered = jsx.renderElements(renderControllerComponent())[0];
        document.body.appendChild(rendered);

        expect(document.body.children).toHaveLength(1);

        await waitForMutation();

        const el = document.body.firstElementChild;

        expect(el?.getAttribute("js")).toBe("test");
        expect(el?.childNodes.length).toBe(1);

        const children = el?.firstElementChild?.children;

        expect(children).toHaveLength(2);
    });
});

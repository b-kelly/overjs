import jsx from "../../src/jsx";
import { JsxController } from "../../src/jsx/JsxController";

/** Showcases the use of both a Function component and a jsx Fragment */
function FunctionComponent() {
    return <>Hello world!</>;
}

/** A simple jsx controller that does nothing but fill itself with text */
export class TestSampleController extends JsxController {
    render(): jsx.ComponentChildren {
        return <FunctionComponent />;
    }
}

/** @see TestSampleController exported as a short name for more friendly use in JSX */
export const TestSample = TestSampleController;

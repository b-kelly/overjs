import jsx from "../../src/jsx";
import { JsxController } from "../../src/jsx/JsxController";
import { Component } from "../../src/jsx/createElement";

/** Showcases the use of both a Function component and a jsx Fragment */
function FunctionComponent() {
    return <>Hello world!</>;
}

/** Showcases the use of a non-Controller class component */
class NonControllerComponent extends Component {
    render(): jsx.ComponentChildren {
        return <>Definitely not a controller</>;
    }
}

/** A simple jsx controller that does nothing but fill itself with other standard components */
export class TestSampleController extends JsxController {
    content(): jsx.ComponentChildren {
        return (
            <ul>
                <li>
                    <FunctionComponent />
                </li>
                <li>
                    <NonControllerComponent />
                </li>
            </ul>
        );
    }
}

/** @see TestSampleController exported as a short name for more friendly use in JSX */
export const TestSample = TestSampleController;

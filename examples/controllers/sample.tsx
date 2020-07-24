import jsx from "../../src/jsx";

function FunctionComponent() {
    return <div>Hello world!</div>;
}

export class TestSampleController extends jsx.Component {
    render(): jsx.ComponentChildren {
        return <FunctionComponent />;
    }
}

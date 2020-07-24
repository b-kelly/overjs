import jsx from "../../src/jsx";

function FunctionComponent() {
    return <>Hello world!</>;
}

export class TestSampleController extends jsx.Component {
    render(): jsx.ComponentChildren {
        return <FunctionComponent />;
    }
}

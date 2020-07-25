import jsx from "../../src/jsx";

class ClassComponent extends jsx.Component {
    // TODO custom props props?: { p1?: boolean } = {};

    render(props?: jsx.ComponentProps): jsx.ComponentChildren {
        return <p>{props?.children}</p>;
    }
}

function FunctionComponent(props?: jsx.ComponentProps) {
    return <span {...props}>This is a test</span>;
}

describe("createElement", () => {
    it("should create with a string type, no props or children", () => {
        const jNode = jsx.createElement("div", null);

        expect(jNode.type).toBe("div");
        expect(jNode.props).toStrictEqual({ children: [] });
    });

    it("should create with a string type, props, no children", () => {
        const jNode = jsx.createElement("div", {
            prop1: "a",
            prop2: 42,
            prop3: true,
        });

        expect(jNode.type).toBe("div");
        expect(jNode.props).toStrictEqual({
            prop1: "a",
            prop2: 42,
            prop3: true,
            children: [],
        });
    });

    it("should create with a string type, props and children", () => {
        const jNode = jsx.createElement(
            "div",
            {
                prop1: "a",
                prop2: 42,
                prop3: true,
            },
            // a bunch of different child elements to match the union type
            { type: "span", props: {} } as jsx.JSX.Element,
            [{ type: "span", props: {} }] as jsx.JSX.Element[],
            [1, 2],
            { test: "a" },
            "str1",
            42,
            true,
            null,
            undefined
        );

        expect(jNode.type).toBe("div");
        expect(jNode.props).toStrictEqual({
            prop1: "a",
            prop2: 42,
            prop3: true,
            children: [
                { type: "span", props: {} } as jsx.JSX.Element,
                [{ type: "span", props: {} }] as jsx.JSX.Element[],
                [1, 2],
                { test: "a" },
                "str1",
                42,
                true,
                null,
                undefined,
            ],
        });
    });

    it("should create with a class type", () => {
        const jNode = jsx.createElement(ClassComponent, null);

        expect(jNode.type).toBe(ClassComponent);
        expect(jNode.props).toStrictEqual({ children: [] });
    });

    it("should create with a function type", () => {
        const jNode = jsx.createElement(FunctionComponent, null);

        expect(jNode.type).toBe(FunctionComponent);
        expect(jNode.props).toStrictEqual({ children: [] });
    });

    it("should handle an invalid string type", () => {
        const jNode = jsx.createElement("fake", null);

        expect(jNode.type).toBe("fake");
        expect(jNode.props).toStrictEqual({ children: [] });
    });

    it("should create with a Fragment root", () => {
        const jNode = jsx.createElement(jsx.Fragment, null);

        expect(jNode.type).toBe(jsx.Fragment);
        expect(jNode.props).toStrictEqual({ children: [] });
    });

    it("should create with a Fragment child", () => {
        const jNode = jsx.createElement(jsx.Fragment, null, {
            type: jsx.Fragment,
            props: {},
        });

        expect(jNode.type).toBe(jsx.Fragment);
        expect(jNode.props).toStrictEqual({
            children: [{ type: jsx.Fragment, props: {} }],
        });
    });
});

describe("render", () => {
    it("should render string types, no props, no children", () => {
        const el = jsx.render(jsx.createElement("div", null));

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe("<div></div>");
    });

    it("should render string types, with props, no children", () => {
        const el = jsx.render(
            jsx.createElement("div", {
                prop1: "value1",
                prop2: 42,
                prop3: true,
                prop4: null,
            })
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe(
            `<div prop1="value1" prop2="42" prop3=""></div>`
        );
    });

    it("should render string types with various child types", () => {
        // primitive types
        let el = jsx.render(
            jsx.createElement(
                "div",
                null,
                "child1",
                42,
                true,
                false,
                null,
                undefined
            )
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe(
            `<div>child142truefalse</div>`
        );

        el = jsx.render(
            jsx.createElement(
                "div",
                null,
                // child node
                {
                    type: "p",
                    props: {
                        prop1: "p1",
                        // nested children
                        children: [
                            "text",
                            // nested child node
                            {
                                type: "span",
                                props: {},
                            },
                        ],
                    },
                }
            )
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe(
            `<div><p prop1="p1">text<span></span></p></div>`
        );
    });

    it("should render a class type", () => {
        const el = jsx.render(
            jsx.createElement(
                ClassComponent,
                null,
                {
                    type: "a",
                    props: {
                        href: "#",
                        children: ["link1"],
                    },
                },
                {
                    type: "a",
                    props: {},
                }
            )
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("P");
        expect((el[0] as HTMLParagraphElement).outerHTML).toBe(
            `<p><a href="#">link1</a><a></a></p>`
        );
    });

    it("should render a function type", () => {
        const el = jsx.render(
            jsx.createElement(
                FunctionComponent,
                {
                    prop1: "test",
                    prop2: null,
                    prop3: false,
                },
                // adding children, but the component (as written) won't render them
                {
                    type: "a",
                    props: {
                        href: "#",
                        children: ["link1"],
                    },
                }
            )
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("SPAN");
        expect((el[0] as HTMLSpanElement).outerHTML).toBe(
            `<span prop1="test">This is a test</span>`
        );
    });

    it("should render an invalid string type", () => {
        const el = jsx.render(jsx.createElement("fake", null));

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("FAKE");
        expect((el[0] as Element).outerHTML).toBe(`<fake></fake>`);
    });

    it("should render with a Fragment root and no children", () => {
        const el = jsx.render(jsx.createElement(jsx.Fragment, null));

        expect(el.length).toBe(0);
    });

    it("should render with a Fragment root and non-fragment children", () => {
        const el = jsx.render(
            jsx.createElement(
                jsx.Fragment,
                {
                    prop1: "doesn't do anything",
                },
                {
                    type: "div",
                    props: {},
                },
                {
                    type: "p",
                    props: {},
                }
            )
        );

        // fragments render "transparently", returning their children instead
        expect(el.length).toBe(2);
        expect(el[0].nodeName).toBe("DIV");
        expect(el[1].nodeName).toBe("P");
    });

    it("should render with a non-Fragment root and Fragment child", () => {
        const el = jsx.render(
            jsx.createElement("div", null, {
                type: jsx.Fragment,
                props: {
                    children: [
                        {
                            type: "a",
                            props: {},
                        },
                        "text1",
                    ],
                },
            })
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect(el[0].childNodes.length).toBe(2);
        expect(el[0].childNodes[0].nodeName).toBe("A");
        expect(el[0].childNodes[1].nodeType).toBe(Node.TEXT_NODE);
        expect((el[0] as Element).outerHTML).toBe(`<div><a></a>text1</div>`);
    });

    it("should render with a Fragment root and immediate Fragment child", () => {
        const el = jsx.render(
            jsx.createElement(jsx.Fragment, null, {
                type: jsx.Fragment,
                props: {
                    children: ["text1"],
                },
            })
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeType).toBe(Node.TEXT_NODE);
    });

    it("should render straight jsx", () => {
        // intrinsic element
        let el = jsx.render(<div className="test">test1</div>)[0] as Element;
        expect(el.outerHTML).toBe(`<div class="test">test1</div>`);

        // class component
        el = jsx.render(
            // TODO custom props <ClassComponent p1={true}>test1</ClassComponent>
            <ClassComponent>
                <a href="#">test link</a>
            </ClassComponent>
        )[0] as Element;
        expect(el.outerHTML).toBe(`<p><a href="#">test link</a></p>`);

        // function component
        // note: we're adding a child, but the component (as written) won't render it
        el = jsx.render(
            <FunctionComponent test="test" p1={true}>
                test1
            </FunctionComponent>
        )[0] as Element;
        expect(el.outerHTML).toBe(
            `<span test="test" p1="">This is a test</span>`
        );

        // fragment (no elements, only nodes)
        const node = jsx.render(<>test1</>)[0];
        expect(node.textContent).toBe(`test1`);

        // fragment (multiple elements)
        const els = jsx.render(
            <>
                <div>test</div>
                <p>test2</p>
            </>
        );
        expect(els.length).toBe(2);
        expect((els[0] as Element).outerHTML).toBe(`<div>test</div>`);
        expect((els[1] as Element).outerHTML).toBe(`<p>test2</p>`);
    });
});

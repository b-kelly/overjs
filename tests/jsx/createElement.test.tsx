import jsx from "../../src/jsx";
import { renderJsxNode } from "../../src/jsx/createElement";

class ClassComponent extends jsx.Component<{ p1?: boolean }> {
    render() {
        return <p>{this.props?.children}</p>;
    }
}

function FunctionComponent(
    props?: jsx.ComponentProps<{ test: string; p1: boolean }>
) {
    return <span {...props}>This is a test</span>;
}

class ClassComponent2 extends jsx.Component {
    render() {
        return [<div></div>, <div></div>];
    }
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

describe("renderElements", () => {
    it("should renderElements string types, no props, no children", () => {
        const el = renderJsxNode(jsx.createElement("div", null));

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe("<div></div>");
    });

    it("should renderElements string types, with props, no children", () => {
        const el = renderJsxNode(
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

    it("should renderElements string types with various child types", () => {
        // primitive types
        let el = renderJsxNode(
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
        expect((el[0] as HTMLDivElement).outerHTML).toBe(`<div>child142</div>`);

        el = renderJsxNode(
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

    it("should renderElements className prop as class", () => {
        const el = renderJsxNode(
            jsx.createElement("div", {
                className: "class1",
            })
        );

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("DIV");
        expect((el[0] as HTMLDivElement).outerHTML).toBe(
            `<div class="class1"></div>`
        );
    });

    it("should renderElements a class type", () => {
        const el = renderJsxNode(
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

    it("should renderElements a function type", () => {
        const el = renderJsxNode(
            jsx.createElement(
                FunctionComponent,
                {
                    test: "test",
                    p1: false,
                },
                // adding children, but the component (as written) won't renderElements them
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
            `<span test="test">This is a test</span>`
        );
    });

    it("should renderElements an invalid string type", () => {
        const el = renderJsxNode(jsx.createElement("fake", null));

        expect(el.length).toBe(1);
        expect(el[0].nodeName).toBe("FAKE");
        expect((el[0] as Element).outerHTML).toBe(`<fake></fake>`);
    });

    it("should renderElements with a Fragment root and no children", () => {
        const el = renderJsxNode(jsx.createElement(jsx.Fragment, null));

        expect(el.length).toBe(0);
    });

    it("should renderElements with a Fragment root and non-fragment children", () => {
        const el = renderJsxNode(
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

        // fragments renderElements "transparently", returning their children instead
        expect(el.length).toBe(2);
        expect(el[0].nodeName).toBe("DIV");
        expect(el[1].nodeName).toBe("P");
    });

    it("should renderElements with a non-Fragment root and Fragment child", () => {
        const el = renderJsxNode(
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

    it("should renderElements with a Fragment root and immediate Fragment child", () => {
        const el = renderJsxNode(
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

    it("should renderElements straight jsx", () => {
        // intrinsic element
        let el = renderJsxNode(<div className="test">test1</div>)[0] as Element;
        expect(el.outerHTML).toBe(`<div class="test">test1</div>`);

        // class component
        el = renderJsxNode(
            <ClassComponent p1={true}>
                <a href="#">test link</a>
            </ClassComponent>
        )[0] as Element;
        expect(el.outerHTML).toBe(`<p><a href="#">test link</a></p>`);

        // function component
        // note: we're adding a child, but the component (as written) won't renderElements it
        el = renderJsxNode(
            <FunctionComponent test="test" p1={true}>
                test1
            </FunctionComponent>
        )[0] as Element;
        expect(el.outerHTML).toBe(
            `<span test="test" p1="">This is a test</span>`
        );

        // fragment (no elements, only nodes)
        const node = renderJsxNode(<>test1</>)[0];
        expect(node.textContent).toBe(`test1`);

        // fragment (multiple elements)
        const els = renderJsxNode(
            <>
                <div>test</div>
                <p>test2</p>
            </>
        );
        expect(els.length).toBe(2);
        expect((els[0] as Element).outerHTML).toBe(`<div>test</div>`);
        expect((els[1] as Element).outerHTML).toBe(`<p>test2</p>`);
    });

    it.each([
        [
            <ul>
                {...["a", "b", "c"].map((i) => <li>{i}</li>)}
                <li>last</li>
            </ul>,
            `<ul><li>a</li><li>b</li><li>c</li><li>last</li></ul>`,
        ],
        [<ClassComponent2 />, `<div></div><div></div>`],
        [
            <>
                <>
                    <></>
                    <>
                        <></>
                    </>
                </>
                <>
                    <></>
                </>
            </>,
            ``,
        ],
        [<jsx.Fragment>test</jsx.Fragment>, `test`],
        [null as unknown as jsx.JSX.Element, ``],
        [
            <ClassComponent>
                a{null}
                {true}
                {false}
                {2}
                {undefined}
                {["b", "c"]}
                {<ClassComponent />}
            </ClassComponent>,
            `<p>a2bc<p></p></p>`,
        ],
        [<div>{(x: number) => x + 1}</div>, `<div>(x) =&gt; x + 1</div>`],
        [
            <div>
                {/* prettier-ignore */ function (x: number) {  return x + 1; }}
            </div>,
            `<div>function (x) { return x + 1; }</div>`,
        ],
        [<div>{{ test: 1 }}</div>, `<div>[object Object]</div>`],
        [<div>{true && <span />}</div>, `<div><span></span></div>`],
        [<div>{false && <span />}</div>, `<div></div>`],
    ])(
        "should renderElements complicated jsx: %s",
        (j: jsx.JSX.Element, renderElementsed: string) => {
            const el = renderJsxNode(j);
            const frag = document.createElement("div");
            frag.append(...el);

            expect(frag.innerHTML).toBe(renderElementsed);
        }
    );

    it("should dangerouslySetInnerHtml", () => {
        const prop = {
            dangerouslySetInnerHTML: {
                __html: "<span>XSS hazard!</span>",
            },
        };

        const el = renderJsxNode(<div {...prop}></div>)[0];

        expect(el.nodeName).toBe("DIV");
        expect(el.childNodes).toHaveLength(1);
        expect(el.firstChild?.nodeName).toBe("SPAN");
        expect(el.firstChild?.childNodes).toHaveLength(1);
        expect(el.firstChild?.firstChild?.textContent).toBe("XSS hazard!");
    });
});

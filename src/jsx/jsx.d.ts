import { Component, JsxNode } from "./createElement";

export = jsx;
export as namespace jsx;

declare namespace jsx {
    /**
     * Makes a Partial of the type, then subs out the "children" property for our version
     * e.g. `HTMLDivElement` has all of its properties made optional, then has the "children" property redefined
     */
    type IntrinsicElement<T = never> = Omit<
        Partial<T>,
        keyof ComponentAttributes
    > &
        ComponentAttributes;

    type ComponentChild =
        | JSX.Element
        // eslint-disable-next-line @typescript-eslint/ban-types
        | object
        | string
        | number
        | boolean
        | null
        | undefined;
    type ComponentChildren = ComponentChild[] | ComponentChild;

    type ComponentAttributes = {
        children?: jsx.ComponentChildren;
        dangerouslySetInnerHTML?: {
            __html: string;
        };
    };

    type ComponentProps<P> = Readonly<P> & Readonly<ComponentAttributes>;

    export namespace JSX {
        type Element = JsxNode<unknown>;
        type ElementClass = Component<unknown>;
        interface ElementAttributesProperty {
            props: { [key: string]: unknown };
        }
        interface ElementChildrenAttribute {
            children: ComponentChildren;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicAttributes {}
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicClassAttributes<T = never> {}

        // maps every built in tag name to the extended version of that tag's class
        // e.g. "div" gets mapped to `IntrinsicElement<HTMLDivElement>`
        type IntrinsicElements = {
            [elemTag in keyof HTMLElementTagNameMap]: IntrinsicElement<
                HTMLElementTagNameMap[elemTag]
            >;
        };
    }
}

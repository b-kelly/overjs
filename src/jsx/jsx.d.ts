import { Component } from "./createElement";

export = jsx;
export as namespace jsx;

declare namespace jsx {
    /**
     * Makes a Partial of the type, then subs out the "children" property for our version
     * e.g. `HTMLDivElement` has all of its properties made optional, then has the "children" property redefined
     */
    type IntrinsicElement<T = never> = Omit<Partial<T>, "children"> & {
        children?: ComponentChildren;
    };

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

    export namespace JSX {
        interface Element {
            props?: unknown;
        }
        type ElementClass = Component;
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

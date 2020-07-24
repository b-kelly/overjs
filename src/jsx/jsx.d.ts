import { Component } from "./JsxController";

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
        | unknown
        | string
        | number
        | boolean
        | null
        | undefined;
    type ComponentChildren = ComponentChild[] | ComponentChild;

    interface ControllerAttributes {
        js?: string;
        "js-target"?: string;
    }

    export namespace JSX {
        interface Element {
            props?: unknown;
        }
        type ElementClass = Component;
        interface ElementAttributesProperty {
            props: unknown;
        }
        interface ElementChildrenAttribute {
            children: ComponentChildren;
        }

        type IntrinsicAttributes = ControllerAttributes;
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicClassAttributes<T = never>
            extends ControllerAttributes {}

        // maps every built in tag name to the extended version of that tag's class
        // e.g. "div" gets mapped to `IntrinsicElement<HTMLDivElement>`
        type IntrinsicElements = {
            [elemTag in keyof HTMLElementTagNameMap]: IntrinsicElement<
                HTMLElementTagNameMap[elemTag]
            >;
        };
    }
}

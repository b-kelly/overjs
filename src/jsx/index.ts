import { Component, createElement, Fragment, render } from "./createElement";
import { JsxController } from "./JsxController";

// export as one default for use in .tsx files
// NOTE must use as `import jsx from "..."` so the compiler knows where jsx.createElement is from
export default {
    Component,
    createElement,
    Fragment,
    render,
    JsxController,
};

// export individually as well in case a consumer wants to tree shake
export { Component, createElement, Fragment, render, JsxController };

import { JsxApplication } from "./JsxApplication";
import { JsxController } from "./JsxController";
import { createElement, Fragment } from "./createElement";

// export as one default for use in .tsx files
// NOTE must use as `import jsx from "..."` so the compiler knows where jsx.createElement is from
export default {
    JsxApplication,
    JsxController,
    createElement,
    Fragment,
};

// export individually as well in case a consumer wants to tree shake
export { JsxApplication, JsxController, createElement, Fragment };

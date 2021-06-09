import {
    Component,
    createElement,
    Fragment,
    renderElements,
} from "./createElement";
import { JsxController } from "./JsxController";

// export as one default for use in .tsx files
// NOTE must use as `import jsx from "..."` so the compiler knows where jsx.createElement is from
export default {
    Component,
    createElement,
    Fragment,
    render: renderElements,
    JsxController,
};

// export individually as well in case a consumer wants to tree shake
export {
    Component,
    createElement,
    Fragment,
    renderElements as render,
    JsxController,
};

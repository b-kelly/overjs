import { Controller, Binding } from "../../src/core";
import Popper from "popper.js";

export const sample = `
<div js="popover"
    data-placement="bottom-start"
    data-toggle-class="is-selected">
    <button class="s-btn s-btn__dropdown" role="button" aria-controls="popover-example" js-target="toggle">
        Toggle popover
    </button>
    <div class="s-popover" id="popover-example" role="menu" js-target="popover">
        <div class="s-popover--arrow"></div>
        This is a test popover
    </div>
</div>
`;

export class PopoverController extends Controller {
    static bindings = {
        toggle: ["click", PopoverController.toggle] as Binding,
    };

    static helpers = {
        togglePopover(instance: PopoverController, shown: boolean): void {
            instance.toggle(shown);
        },
    };

    private popper: Popper;

    get isVisible() {
        var popover = this.target("popover");

        return popover && popover.classList.contains("is-visible");
    }

    connect() {
        this.validate();

        if (this.isVisible) {
            // just call initialize here, not show. This keeps already visible popovers from adding/firing document events
            this.initializePopper();
        }
    }

    disconnect() {
        this.toggle(false);
        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }
    }

    public toggle(show?: boolean) {
        let currentlyVisible = this.isVisible;
        let toShow = show;

        if (typeof show === "undefined") {
            toShow = !currentlyVisible;
        }

        if ((toShow && currentlyVisible) || (!toShow && !currentlyVisible)) {
            return;
        }

        let triggeredEvent = this.triggerEvent(toShow ? "show" : "hide");

        if (triggeredEvent.defaultPrevented) {
            return;
        }

        if (!this.popper) {
            this.initializePopper();
        }

        let popover = this.target("popover");

        popover.classList.toggle("is-visible", toShow);

        if (toShow) {
            this.popper.enableEventListeners();
            this.scheduleUpdate();
            this.bindDocumentEvents();
            this.toggleOptionalClasses(true);
        } else {
            this.popper.disableEventListeners();
            this.unbindDocumentEvents();
            this.toggleOptionalClasses(false);
        }

        this.triggerEvent(toShow ? "shown" : "hide");
    }

    private validate() {
        //TODO
    }

    private initializePopper() {
        let popover = this.target("popover");
        let referenceElement = this.target("toggle");
        this.popper = new Popper(referenceElement, popover, {
            eventsEnabled: this.isVisible,
        });

        this.popper.options.placement =
            (this.data.placement as Popper.Placement) || "bottom";
    }

    private scheduleUpdate() {
        if (this.popper && this.isVisible) {
            this.popper.scheduleUpdate();
        }
    }

    private bindDocumentEvents() {
        this.bindDocumentEvent("click", "hideOnClick", this.hideOnOutsideClick);
        this.bindDocumentEvent("keyup", "hideOnEsc", this.hideOnEsc);
    }

    private unbindDocumentEvents() {
        this.unbindDocumentEvent("click", "hideOnClick");
        this.unbindDocumentEvent("keyup", "hideOnEsc");
    }

    private hideOnOutsideClick(e: MouseEvent) {
        let target = <Node>e.target;
        var popover = this.target("popover");

        if (!popover?.contains(target)) {
            PopoverController.toggle.call(this, false);
        }

        return false;
    }

    private hideOnEsc(e: KeyboardEvent) {
        if (e.key !== "Escape") {
            return true;
        }

        PopoverController.toggle.call(this, false);

        return false;
    }

    private toggleOptionalClasses(show?: boolean) {
        if (!this.data.toggleClass) {
            return;
        }

        let referenceElement = this.target("toggle");

        var cl = referenceElement.classList;
        this.data.toggleClass!.split(/\s+/).forEach(function (cls: string) {
            cl.toggle(cls, show);
        });
    }

    public static toggle(this: PopoverController, e: Event) {
        this.toggle();
    }
}

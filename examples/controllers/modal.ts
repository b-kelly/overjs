import { Controller, Binding } from "../../src/core";

export let sample = `
<div js="modal">
    <button type="button" class="s-btn s-btn__primary" js-target="show">Show modal</button>
    <aside class="s-modal" js-target="modal" aria-hidden="true">
        <div class="s-modal--dialog">
            <h1 class="s-modal--header" id="modal-title">Sample modal</h1>
            <p class="s-modal--body" id="modal-description">A bunch of sample text.</p>
            <div class="grid gs8 gsx s-modal--footer">
                <button class="grid--cell s-btn s-btn__primary" type="button">Submit</button>
                <button class="grid--cell s-btn" type="button" js-target="hide">Cancel</button>
            </div>
            <a href="#" class="s-modal--close s-btn s-btn__muted" href="#" aria-label="Close" js-target="hide">
                <svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41z"></path></svg>
            </a>
        </div>
    </aside>
</div>
`;

export class ModalController extends Controller {
    static bindings = {
        show: ['click', ModalController.show] as Binding,
        hide: ['click', ModalController.hide] as Binding
    };

    static helpers = {
        showModal(instance: ModalController): void {
            instance.show();
        },

        hideModal(instance: ModalController) {
            instance.hide();
        }
    };

    connect() {
        this.validate();
    }

    disconnect() {
        this.unbindHideEvents();
    }

    show() {
        this.toggle(true);
    }

    hide() {
        this.toggle(false);
    }

    private validate() {
        //TODO
    }

    private toggle(show?: boolean | undefined) {
        let toShow = show;
        let modal = this.target('modal');
        let isVisible = modal.getAttribute('aria-hidden') === 'false';

        // if we're letting the class toggle, we need to figure out if the popover is visible manually
        if (typeof toShow === "undefined") {
            toShow = !isVisible;
        }

        // if the state matches the disired state, return without changing anything
        if ((toShow && isVisible) || (!toShow && !isVisible)) {
            return;
        }

        let returnElement = <HTMLElement>this.target('returnElement');

        // show/hide events trigger before toggling the class
        var triggeredEvent = this.triggerEvent(toShow ? "show" : "hide", { returnElement: returnElement }, modal);

        // if this pre-show/hide event was prevented, don't attempt to continue changing the modal state
        if (triggeredEvent.defaultPrevented) {
            return;
        }

        returnElement = triggeredEvent.detail.returnElement;
        modal.setAttribute("aria-hidden", toShow ? "false" : "true");

        if (toShow) {
            this.bindHideEvents();
        }
        else {
            this.unbindHideEvents();
            this.focusReturnElement(returnElement);
            this.removeModalOnHide();
        }

        // check for transitionend support
        var supportsTransitionEnd = (<HTMLElement>modal).ontransitionend !== undefined;

        // shown/hidden events trigger after toggling the class
        if (supportsTransitionEnd) {
            // wait until after the modal finishes transitioning to fire the event
            modal.addEventListener("transitionend", () => {
                //TODO this is firing waaay to soon?
                this.triggerEvent(toShow ? "shown" : "hidden", null, modal);
            }, { once: true });
        } else {
            this.triggerEvent(toShow ? "shown" : "hidden", null, modal);
        } 
    }

    private bindHideEvents() {
        this.bindDocumentEvent('keyup', 'hideOnEsc', this.hideOnEsc);
        this.bindDocumentEvent('click', 'hideOnOutsideClick', this.hideOnOutsideClick);
        this.handleFocusableElements();
    }

    private unbindHideEvents() {
        this.unbindDocumentEvent('keyup', 'hideOnEsc');
        this.unbindDocumentEvent('click', 'hideOnOutsideClick');
        this.unbindDocumentEvent('keydown', 'trapTab');
    }

    private focusReturnElement(returnElement: HTMLElement) {
        if (!returnElement) {
            return;
        }

        let modal = this.target('modal');

        //TODO prefix event
        modal.addEventListener("modal:hidden", () => {
            // double check the element still exists when the event is called
            if (returnElement && document.body.contains(returnElement)) {
                returnElement.focus();
            }
        }, {once: true });
    }

    private removeModalOnHide() {
        if (this.data.removeWhenHidden !== "true") {
            return;
        }

        let modal = this.target('modal');

        //TODO prefix event
        modal.addEventListener("modal:hidden", () => {
            this.baseElement.remove();
        }, {once: true });
    }

    private hideOnOutsideClick(e: MouseEvent) {
        let target = <Node>e.target;
        let modal = this.target('modal');

        if (!modal.querySelector('.s-modal--dialog')?.contains(target)) {
            ModalController.hide.call(this, e);
        }

        return false;
    }

    private hideOnEsc(e: KeyboardEvent) {
        if (e.key !== 'Escape') {
            return true;
        }

        ModalController.hide.call(this, e);

        return false;
    }

    private handleFocusableElements() {
        let modal = this.target('modal');

        // get all tabbable items
        var allTabbables = Array.from(modal.querySelectorAll<HTMLElement>("[href], input, select, textarea, button, [tabindex]"))
            .filter((el: Element) => el.matches(":not([disabled]):not([tabindex='-1'])"));

        if (!allTabbables.length) {
            return;
        }

        var initialFocus = allTabbables[0];

        var intialFocusTarget = this.target('initialFocus');
        if (intialFocusTarget) {
            initialFocus = intialFocusTarget;
        }

        // focus on the first focusable item within the modal
        modal.addEventListener("modal:shown", () => {
            // double check the element still exists when the event is called
            if (initialFocus && document.body.contains(initialFocus)) {
                initialFocus.focus()
            }
        }, {once: true });

        var firstTabbable = <HTMLElement>allTabbables[0];
        var lastTabbable = <HTMLElement>allTabbables[allTabbables.length - 1];

        // if the first or last item is tabbed over, ensure that the focus "loops" back to the end of the array instead of leaving the modal
        this.bindDocumentEvent('keydown', 'trapTab', (e: KeyboardEvent) => {  
            // if somehow the user has tabbed out of the modal or if focus started outside the modal, push them to the first item
            if (!modal.contains(<Element>e.target)) {
                e.preventDefault();
                firstTabbable.focus();
            }
    
            // if they've tabbed backwards over the first item, then go to the last item
            if (e.target == firstTabbable && e.keyCode === 9 && e.shiftKey) {
                e.preventDefault();
                lastTabbable.focus();
            }
    
            // if they've tabbed forwards over the last item, then go to the first item
            if (e.target == lastTabbable && e.keyCode === 9 && !e.shiftKey) {
                e.preventDefault();
                firstTabbable.focus();
            }
        });

        return initialFocus;
    }

    static show(this: ModalController, e: Event) {
        this.show();
    }

    static hide(this: ModalController, e: Event) {
        this.hide();
    }
}
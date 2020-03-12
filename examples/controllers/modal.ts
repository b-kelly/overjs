import { Controller } from "../../src/index";
import { Binding } from "../../src/controller";

export let sample = `
<div ov="modal">
    <button type="button" class="s-btn s-btn__primary" ov-target="show">Show modal</button>
    <aside class="s-modal" ov-target="modal" aria-hidden="true">
        <div class="s-modal--dialog">
            <h1 class="s-modal--header" id="modal-title">Sample modal</h1>
            <p class="s-modal--body" id="modal-description">A bunch of sample text.</p>
            <div class="grid gs8 gsx s-modal--footer">
                <button class="grid--cell s-btn s-btn__primary" type="button">Submit</button>
                <button class="grid--cell s-btn" type="button" ov-target="hide">Cancel</button>
            </div>
            <a href="#" class="s-modal--close s-btn s-btn__muted" href="#" aria-label="Close" ov-target="hide">
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

    connect() {
        console.log('modal connected');
    }

    static show(this: ModalController, e: Event) {
        this.target('modal').setAttribute('aria-hidden', 'false');
    }

    static hide(this: ModalController, e: Event) {
        this.target('modal').setAttribute('aria-hidden', 'true');
    }
}
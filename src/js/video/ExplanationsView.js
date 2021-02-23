import DOM from '../common/DOM.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';

export default class ExplanationsView {

    #explanationsModel;
    #$explanationsToggle;
    #$explanationsContents;

    constructor(explanationsModel) {
        this.#explanationsModel = explanationsModel;
        this.#$explanationsToggle = DOM.query('#explanationsToggle');
        this.#$explanationsContents = DOM.query('#explanationsContents');
    }

    setUpEvent() {
        DOM.click(this.#$explanationsToggle, () => {
            this.#explanationsModel.toggle();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS, () => {
            this.#render();
        });
        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.#render();
        });

        this.#render();
    }

    #render() {
        if (this.#explanationsModel.isOpen()) {
            this.#$explanationsToggle.textContent = '説明文を閉じる';
            DOM.block(this.#$explanationsContents);
        } else {
            this.#$explanationsToggle.textContent = '説明文を開く';
            DOM.none(this.#$explanationsContents);
        }
    }
}
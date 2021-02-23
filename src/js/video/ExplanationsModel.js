import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';

export default class ExplanationsModel {

    #isOpen;

    constructor() {
        this.#isOpen = true;
    }

    toggle() {
        this.#isOpen  = !this.#isOpen;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS);
    }

    changeState(isOpen) {
        this.#isOpen = isOpen;
    }

    isOpen() {
        return this.#isOpen;
    }
}
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

export default class ToggleableContentsModel {

    #toggleEventName;
    #isOpen;

    constructor(toggleEventName, isOpenDefault) {
        this.#toggleEventName = toggleEventName;
        this.#isOpen = isOpenDefault;
    }

    toggle() {
        this.#isOpen  = !this.#isOpen;
        CommonEventDispatcher.dispatch(this.#toggleEventName);
    }

    changeState(isOpen) {
        this.#isOpen = isOpen;
    }

    isOpen() {
        return this.#isOpen;
    }
}
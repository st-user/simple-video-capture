import DOM from '../common/DOM.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

class StateModel {

    #isOpened;
    #eventName;
    
    constructor(eventName) {
        this.#isOpened = false;
        this.#eventName = eventName;
    }

    toggle() {
        this.#isOpened = !this.#isOpened;
        CommonEventDispatcher.dispatch(this.#eventName);
    }

    open() {
        this.#isOpened = true;
        CommonEventDispatcher.dispatch(this.#eventName);
    }

    close() {
        this.#isOpened = false;
        CommonEventDispatcher.dispatch(this.#eventName);
    }

    isOpened() {
        return this.#isOpened;
    }
}

export default class HoverWindowView {

    #stateModel;
    #eventName;

    #$handle;
    #$contents;

    constructor(eventName, handleSelector, contentsSelector) {
        this.#stateModel = new StateModel(eventName);
        this.#eventName = eventName;
        this.#$handle = DOM.query(handleSelector);
        this.#$contents = DOM.query(contentsSelector);
    }

    setUpEvent() {
        DOM.click(this.#$handle, event => {
            event.stopPropagation();
            this.#stateModel.toggle();
        });

        DOM.click(this.#$contents, event => event.stopPropagation());

        window.addEventListener('click', () => {
            this.#stateModel.close();
        });

        CommonEventDispatcher.on(this.#eventName, () => {
            this.#render();
        });

        this.#stateModel.close();
    }

    #render() {
        DOM.display(this.#$contents, this.#stateModel.isOpened());
    }
}
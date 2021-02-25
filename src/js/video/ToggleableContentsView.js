import DOM from '../common/DOM.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

export default class ToggleableContentsView {

    #toggleableModel;
    #$toggle;
    #$contents;

    #toggleEventName;
    #contentsName;

    constructor(
        toggleableModel, 
        selectorForToggle, 
        selectorForContents, 
        toggleEventName,
        contentsName) {

        this.#toggleableModel = toggleableModel;
        this.#$toggle = DOM.query(selectorForToggle);
        this.#$contents = DOM.query(selectorForContents);
        this.#toggleEventName = toggleEventName;
        this.#contentsName = contentsName;
    }

    setUpEvent() {
        DOM.click(this.#$toggle, () => {
            this.#toggleableModel.toggle();
        });

        CommonEventDispatcher.on(this.#toggleEventName, () => {
            this.render();
        });

        this.render();

        this.setUpEventSpecific();
    }

    /* implements at subclasses */
    setUpEventSpecific() {}

    render() {
        if (this.#toggleableModel.isOpen()) {
            this.#$toggle.textContent = `${this.#contentsName}を閉じる`;
            DOM.block(this.#$contents);
        } else {
            this.#$toggle.textContent = `${this.#contentsName}を開く`;
            DOM.none(this.#$contents);
        }
        this.renderSpecific();
    }

    /* implements at subclasses */
    renderSpecific() {}
}
import DOM from '../common/DOM.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import ToggleableContentsView from './ToggleableContentsView.js';

class ReasonModel {

    #isOpened;
    
    constructor() {
        this.#isOpened = false;
    }

    open() {
        this.#isOpened = true;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_REASON_FOR_MAIN_NOTICE);
    }

    close() {
        this.#isOpened = false;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_REASON_FOR_MAIN_NOTICE);
    }

    isOpened() {
        return this.#isOpened;
    }
}

export default class MainNoticeView extends ToggleableContentsView{

    #reasonModel;

    #$openTheReasonForMainNotice;
    #$reasonForMainNotice;

    constructor(explanationsModel) {
        super(
            explanationsModel,
            '#windowSplitImageToggle',
            '#windowSplitImageContents',
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_WINDOW_SPLIT_IMAGE,
            'イメージ'
        );
        this.#reasonModel = new ReasonModel();
        this.#$openTheReasonForMainNotice = DOM.query('#openTheReasonForMainNotice');
        this.#$reasonForMainNotice = DOM.query('#reasonForMainNotice');
    }

    setUpEventSpecific() {
        DOM.click(this.#$openTheReasonForMainNotice, event => {
            event.stopPropagation();
            this.#reasonModel.open();
        });

        window.addEventListener('click', () => {
            this.#reasonModel.close();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.render();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_REASON_FOR_MAIN_NOTICE, () => {
            this.#renderReasonForMainNotice();        
        });

        this.#renderReasonForMainNotice();
    }

    #renderReasonForMainNotice() {
        if (this.#reasonModel.isOpened()) {
            DOM.block(this.#$reasonForMainNotice);
        } else {
            DOM.none(this.#$reasonForMainNotice);
        }
    }
}
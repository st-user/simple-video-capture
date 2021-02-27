import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import ToggleableContentsView from './ToggleableContentsView.js';
import HoverWindowView from './HoverWindowView.js';

export default class MainNoticeView {

    #windowSplitImageView;
    #reasonView;

    constructor(explanationsModel) {
        
        this.#windowSplitImageView = new ToggleableContentsView(
            explanationsModel,
            '#windowSplitImageToggle',
            '#windowSplitImageContents',
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_WINDOW_SPLIT_IMAGE,
            'イメージ'
        );

        this.#reasonView = new HoverWindowView(
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_REASON_FOR_MAIN_NOTICE,
            '#openTheReasonForMainNotice',
            '#reasonForMainNotice'
        );

    }

    setUpEvent() {
        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.#windowSplitImageView.render();
        });
        this.#windowSplitImageView.setUpEvent();
        this.#reasonView.setUpEvent();
    }
}
import { CommonEventDispatcher, ToggleableContentsView, HoverWindowView } from 'vncho-lib';
import { CustomEventNames } from '../common/CustomEventNames.js';

export default class MainNoticeView {

    #windowSplitImageView;
    #reasonView;

    constructor(mainNoticeModel) {
        
        this.#windowSplitImageView = new ToggleableContentsView(
            mainNoticeModel,
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

    setUpEvents() {
        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.#windowSplitImageView.render();
        });
        this.#windowSplitImageView.setUpEvents();
        this.#reasonView.setUpEvents();
    }
}
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import ToggleableContentsView from './ToggleableContentsView.js';

export default class ExplanationsView extends ToggleableContentsView{

    constructor(explanationsModel) {
        super(
            explanationsModel,
            '#explanationsToggle',
            '#explanationsContents',
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS,
            '説明文'
        );
    }

    setUpEventSpecific() {
        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.render();
        });
    }
}
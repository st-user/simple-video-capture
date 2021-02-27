import { CustomEventNames } from '../common/CustomEventNames.js';
import HoverWindowView from './HoverWindowView.js';

export default class ExplanationsView {

    #view;

    constructor() {
        this.#view = new HoverWindowView(
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS,
            '#showExplanations',
            '#explanations'
        );
    }

    setUpEvent() {
        this.#view.setUpEvent();
    }

}
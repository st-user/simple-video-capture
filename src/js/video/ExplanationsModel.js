import { CustomEventNames } from '../common/CustomEventNames.js';
import ToggleableContentsModel from './ToggleableContentsModel.js';

export default class ExplanationsModel extends ToggleableContentsModel {
    constructor() {
        super(
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS,
            true
        );
    }
}
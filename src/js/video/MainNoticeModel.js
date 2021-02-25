import { CustomEventNames } from '../common/CustomEventNames.js';
import ToggleableContentsModel from './ToggleableContentsModel.js';

export default class MainNoticeModel extends ToggleableContentsModel {
    constructor() {
        super(
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_WINDOW_SPLIT_IMAGE,
            true
        );
    }
}
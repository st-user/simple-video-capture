import { CustomEventNames } from '../common/CustomEventNames.js';
import { BooleanStateModel } from 'vncho-lib';

export default class MainNoticeModel extends BooleanStateModel {
    constructor() {
        super(
            CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_WINDOW_SPLIT_IMAGE,
            true
        );
    }
}
import { CaptureControlState, VideoSizeDef } from './CaptureControlState.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import VideoHandler from './VideoHandler.js';
import { 
    checkAll, 
    checkIfInputValueEmpty, 
    checkIfInputValueMatchesRegExp,
    checkIfIntegerGreaterEqual
} from '../common/InputCheck.js';


const sizeRegExp = /^\d+$/;
const sizeEmptyErrorMessage = '動画サイズを入力してください';
const sizeFormatErrorMessage = '動画サイズは1以上の整数で入力してください';

const VIDEO_SIZE_DEFAULT = 'default';
const VIDEO_SIZE_ARBITRARY = 'arbitrary';

export default class CaptureControlModel {

    #state;

    #selectedVideoSize;
    #videoWidth;
    #videoHeight;
    #videoLength;

    #errorMessage;

    #videoHandler;

    constructor() {
        this.#state = CaptureControlState.BEFORE_PREVIEW;
        this.#selectedVideoSize = VIDEO_SIZE_DEFAULT;
        this.#videoWidth = 0;
        this.#videoHeight = 0;
        this.#videoLength = 0;

        this.#videoHandler = new VideoHandler();
    }

    async preview() {
        if (this.isPreviewBtnDisabled()) {
            return;
        }
        this.#resetVideoSizeSelection();

        await this.#videoHandler.preview(this.#videoWidth, this.#videoHeight, () => {
            this.#state = CaptureControlState.READY_TO_CAPTURE;
        });
    }

    captureStart() {
        if (this.isCaptureStartBtnDisabled()) {
            return;
        }
        this.#state = CaptureControlState.CAPTURING;
        this.#videoHandler.startCapturing(this.#videoLength);
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_CAPTURING);
    }

    resetState() {
        this.#state = CaptureControlState.BEFORE_PREVIEW;
    }

    captureEnd() {
        if (this.isCaptureEndBtnDisabled()) {
            return;
        }
        this.#resetVideoSizeSelection();
        this.#state = CaptureControlState.BEFORE_PREVIEW;
        this.#videoHandler.stopCapturing();
    }

    async changeVideoSize(selectedVideoSize, width, height) {
        this.#errorMessage = '';
        this.#selectedVideoSize = selectedVideoSize;
        await this.setVideoSize(width, height);
    }

    async setVideoSize(width, height) {
        this.#errorMessage = '';
        const selectedVideoSize = this.#selectedVideoSize;

        switch(selectedVideoSize) {
        case VIDEO_SIZE_DEFAULT:
            this.#videoWidth = 0;
            this.#videoHeight = 0;
            break;
        case VIDEO_SIZE_ARBITRARY: {
            // error check
            const errorCheck = inputValue => {
                return checkAll(
                    inputValue,
                    [
                        checkIfInputValueEmpty(sizeEmptyErrorMessage),
                        checkIfInputValueMatchesRegExp(sizeRegExp, sizeFormatErrorMessage, true),
                        checkIfIntegerGreaterEqual(1, sizeFormatErrorMessage)
                    ]
                );
            };
            let errorMessage = errorCheck(width);
            errorMessage = errorMessage || errorCheck(height);
            if (errorMessage) {
                this.#errorMessage = errorMessage;
                break;
            }

            this.#videoWidth = parseInt(width, 10);
            this.#videoHeight = parseInt(height, 10);
            break;
        }
        default:
            this.#videoWidth = VideoSizeDef[selectedVideoSize].width;
            this.#videoHeight = VideoSizeDef[selectedVideoSize].height;
        }
        if (!this.#errorMessage) {
            await this.#videoHandler.setSize(this.#videoWidth, this.#videoHeight);
        }
        this.#notifyStateChange();
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__VIDEO_SIZE_CHANGE);
    }

    setVideoLength(videoLength) {
        this.#videoLength = videoLength;
    }

    isPreviewBtnDisabled() {
        return this.#errorMessage || this.#state === CaptureControlState.CAPTURING;
    }

    isCaptureStartBtnDisabled() {
        return this.#errorMessage || this.#state !== CaptureControlState.READY_TO_CAPTURE;
    }

    isCaptureEndBtnDisabled() {
        return this.#errorMessage || this.#state !== CaptureControlState.CAPTURING;
    }

    isCapturing() {
        return this.#state === CaptureControlState.CAPTURING;
    }

    isVideoSizeSelectionDisabled() {
        return this.#state !== CaptureControlState.READY_TO_CAPTURE;
    }

    isVideoLengthSelectionDisabled() {
        return this.#state === CaptureControlState.CAPTURING;
    }

    isVideoSizeArbitrary() {
        return this.#selectedVideoSize === VIDEO_SIZE_ARBITRARY;
    }

    getErrorMessage() {
        return this.#errorMessage;
    }

    getStream() {
        return this.#videoHandler.getStream();
    }

    getVideoSetting() {
        return this.#videoHandler.getVideoSetting();
    }

    #resetVideoSizeSelection() {
        this.#selectedVideoSize = VIDEO_SIZE_DEFAULT;
        this.#videoWidth = 0;
        this.#videoHeight = 0;
    }

    #notifyStateChange() {
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CONTROL_STATE_CHANGE);
    }
}
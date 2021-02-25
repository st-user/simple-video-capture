import { CaptureControlState, VideoSizeDef } from './CaptureControlConst.js';
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
    #forceDisabled;

    #useAutoStart;
    #autoStartDelay;
    #autoStartDelayCount;

    #selectedVideoSize;
    #videoWidth;
    #videoHeight;
    #videoLength;

    #errorMessage;

    #videoHandler;

    constructor() {
        this.#state = CaptureControlState.BEFORE_PREVIEW;
        this.#forceDisabled = false;

        this.#useAutoStart = true;
        this.#autoStartDelay = 0;
        this.#autoStartDelayCount = 0;

        this.#selectedVideoSize = VIDEO_SIZE_DEFAULT;
        this.#videoWidth = 0;
        this.#videoHeight = 0;
        this.#videoLength = 10;

        this.#videoHandler = new VideoHandler();
    }

    async preview() {
        if (this.isPreviewBtnDisabled()) {
            return;
        }
        this.#state = CaptureControlState.BEFORE_PREVIEW;
        const canCapture = await this.#videoHandler.preview({
            width: () => this.#videoWidth,
            height: () => this.#videoHeight
        });

        if (canCapture) {
            this.#state = CaptureControlState.READY_TO_CAPTURE;
            CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW);
            this.#startCountDown();
        }
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
        this.#state = CaptureControlState.BEFORE_PREVIEW;
        this.#videoHandler.stopCapturing();
    }

    changeAutoStartSetting(useAutoStart, autoStartDelay) {
        this.#useAutoStart = useAutoStart;
        this.#autoStartDelay = autoStartDelay;
    }

    changeVideoSize(selectedVideoSize, width, height) {
        this.#errorMessage = '';
        this.#selectedVideoSize = selectedVideoSize;
        this.setVideoSize(width, height);
    }

    setVideoSize(width, height) {
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
            this.adjustVideoCanvasSize();
        }

        this.#notifyStateChange();
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__VIDEO_SIZE_CHANGE);
    }

    adjustVideoCanvasSize() {
        this.#videoHandler.adjustVideoCanvasSize(this.#videoWidth, this.#videoHeight);
    }

    getVideoActualSize() {
        return this.#videoHandler.getVideoActualSize(this.#videoWidth, this.#videoHeight);
    }

    setVideoLength(videoLength) {
        this.#videoLength = videoLength;
    }

    setForceDisabled(isDisabled) {
        this.#forceDisabled = isDisabled;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CONTROL_STATE_CHANGE);   
    }

    isPreviewBtnDisabled() {
        return this.#isForceDisabled() || this.#errorMessage || this.#state === CaptureControlState.CAPTURING;
    }

    isCaptureStartBtnDisabled() {
        return this.#isForceDisabled() || this.#errorMessage || this.#state !== CaptureControlState.READY_TO_CAPTURE;
    }

    isCaptureEndBtnDisabled() {
        return this.#isForceDisabled() || this.#errorMessage || this.#state !== CaptureControlState.CAPTURING;
    }

    isCapturing() {
        return this.#state === CaptureControlState.CAPTURING;
    }

    isAutoStartDelayDisabled() {
        return this.#isForceDisabled() || this.#state !== CaptureControlState.BEFORE_PREVIEW;
    }

    isVideoSizeSelectionDisabled() {
        if (this.#isForceDisabled()) {
            return true;
        }
        if (this.#useAutoStart) {
            return this.#state !== CaptureControlState.BEFORE_PREVIEW;
        } 
        return this.#state === CaptureControlState.CAPTURING;
    }

    isVideoLengthSelectionDisabled() {
        if (this.#isForceDisabled()) {
            return true;
        }
        if (this.#useAutoStart) {
            return this.#state !== CaptureControlState.BEFORE_PREVIEW;
        } 
        return this.#state === CaptureControlState.CAPTURING;
    }

    isVideoSizeArbitrary() {
        return this.#selectedVideoSize === VIDEO_SIZE_ARBITRARY;
    }

    getErrorMessage() {
        return this.#errorMessage;
    }

    getVideoCanvas() {
        return this.#videoHandler.getVideoCanvas();
    }

    getAutoStartDelayCount() {
        return this.#autoStartDelayCount;
    }

    #startCountDown() {
        if (!this.#useAutoStart) {
            return;
        }
        this.#autoStartDelayCount = this.#autoStartDelay;
        const countDown = () => {
            if (this.#state !== CaptureControlState.READY_TO_CAPTURE) {
                this.#autoStartDelayCount = 0;
                return;
            }
            CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__COUNT_DOWN_TO_START_CAPTURING);
            if (this.#autoStartDelayCount === 0) {
                this.captureStart();
                return;
            }
            setTimeout(() => {
                this.#autoStartDelayCount--;
                countDown();
            }, 1000);
        };
        setTimeout(countDown, 0);
    }

    #isForceDisabled() {
        return this.#forceDisabled;
    }

    #notifyStateChange() {
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CONTROL_STATE_CHANGE);
    }
}
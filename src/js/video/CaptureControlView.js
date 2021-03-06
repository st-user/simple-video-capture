import { CommonEventDispatcher, DOM, debounce }  from 'vncho-lib';

import { MessageType } from './CaptureControlConst.js';
import { CustomEventNames } from '../common/CustomEventNames.js';

const videoInfoTemplate = data => {
    return `
        ▼録画対象 [サイズ：${data.width}x${data.height}]
    `;
};

export default class CaptureControlView {

    #captureControlModel;
    #mainNoticeModel;
    #resultModel;

    #$preview;
    #$captureStart;
    #$captureEnd;
    #$nowCapturing;

    #$previewArea;
    #$videoInfo;

    #$messageArea;
    
    #$useAutoStart;
    #$autoStartDelaySelection;

    #$videoSizeSelection;
    #$videoSizeInputArea;
    #$videoWidth;
    #$videoHeight;
    #$videoSizeAdjustmentMethodArea;
    #$videoSizeAdjustmentMethod;


    #$videoLengthSelection;

    constructor(caputureControlModel, mainNoticeModel, resultModel) {
        this.#captureControlModel = caputureControlModel;
        this.#mainNoticeModel = mainNoticeModel;
        this.#resultModel = resultModel;

        this.#$preview = DOM.query('#preview');
        this.#$captureStart = DOM.query('#captureStart');
        this.#$captureEnd = DOM.query('#captureEnd');
        this.#$nowCapturing = DOM.query('#nowCapturing');

        this.#$previewArea = DOM.query('#previewArea');
        this.#$videoInfo = DOM.query('#videoInfo');

        this.#$messageArea = DOM.query('#messageArea');

        this.#$useAutoStart = DOM.query('#useAutoStart');
        this.#$autoStartDelaySelection = DOM.query('#autoStartDelay');

        this.#$videoSizeSelection = DOM.query('#videoSizeSelection');
        this.#$videoSizeInputArea = DOM.query('#videoSizeInputArea');
        this.#$videoWidth = DOM.query('#videoWidth');
        this.#$videoHeight = DOM.query('#videoHeight');
        this.#$videoSizeAdjustmentMethodArea = DOM.query('#videoSizeAdjustmentMethodArea');
        this.#$videoSizeAdjustmentMethod = DOM.all('#videoSizeAdjustmentMethodArea input[name="videoSizeAdjustmentMethod"]');

        this.#$videoLengthSelection = DOM.query('#videoLengthSelection');
    }

    setUpEvents() {

        DOM.click(this.#$preview, async event => {
            event.preventDefault();
            if (!this.#resultModel.confirmToClear()) {
                return;
            }
            this.#mainNoticeModel.setValue(false);
            DOM.none(this.#$previewArea);
            await this.#captureControlModel.preview();
        });
        DOM.click(this.#$captureStart, event => {
            event.preventDefault();
            this.#captureControlModel.captureStart();
        });
        DOM.click(this.#$captureEnd, event => {
            event.preventDefault();
            this.#captureControlModel.captureEnd();
        });

        const changeAutoStartSetting = () => {
            this.#captureControlModel.changeAutoStartSetting(
                this.#$useAutoStart.checked, 
                parseInt(DOM.optionValue(this.#$autoStartDelaySelection), 10)
            );
        };
        DOM.change(this.#$useAutoStart, changeAutoStartSetting);
        DOM.change(this.#$autoStartDelaySelection, changeAutoStartSetting);

        const changeVideoSize = () => {
            this.#captureControlModel.changeVideoSize(
                DOM.optionValue(this.#$videoSizeSelection),
                this.#$videoWidth.value,
                this.#$videoHeight.value
            );
        };
        DOM.change(this.#$videoSizeSelection, changeVideoSize);

        const changeVideoSizeAdjustmentMethod = $elem => {
            this.#captureControlModel.setVideoSizeAdjustmentMethod($elem.value);
        };
        this.#$videoSizeAdjustmentMethod.forEach(
            $elem => DOM.change($elem, () => changeVideoSizeAdjustmentMethod($elem))
        );

        const changeVideoLength = () => {
            this.#captureControlModel.setVideoLength(
                parseInt(DOM.optionValue(this.#$videoLengthSelection), 10)
            );
        };
        DOM.change(this.#$videoLengthSelection, changeVideoLength);

        DOM.change([ this.#$videoWidth, this.#$videoHeight ], () => {
            this.#captureControlModel.setVideoSize(
                this.#$videoWidth.value, this.#$videoHeight.value
            );
        });
    
        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.#renderVideo();
            this.#renderControls();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__COUNT_DOWN_TO_START_CAPTURING, () => {
            this.#renderControls();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_CAPTURING, () => {
            this.#renderControls();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING, () => {
            this.#captureControlModel.resetState();
            this.#renderVideo();
            this.#renderControls();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__VIDEO_SIZE_CHANGE, () => {
            this.#resizeVideo();
            this.#renderControls();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CONTROL_STATE_CHANGE, () => {
            this.#renderControls();
        });

        window.addEventListener('resize', debounce(() => {
            this.#resizeVideo();
        }, 500));


        changeAutoStartSetting();
        changeVideoSize();
        this.#$videoSizeAdjustmentMethod.forEach($elem => {
            if ($elem.checked) {
                changeVideoSizeAdjustmentMethod($elem);
            }    
        });
        changeVideoLength();
        this.#renderVideo();
        this.#renderControls();
    }

    #renderVideo() {
        if (!this.#captureControlModel.getVideoCanvas()) {
            DOM.none(this.#$previewArea);
            return;
        }
        DOM.block(this.#$previewArea);

        this.#$previewArea.appendChild(this.#captureControlModel.getVideoCanvas());

        this.#resizeVideo();     
    }

    #resizeVideo() {
        this.#captureControlModel.adjustVideoCanvasSize();
        const size = this.#captureControlModel.getVideoActualSize();
        if (!size) {
            return;
        }
        const { width, height } = size;
        this.#$videoInfo.textContent = videoInfoTemplate({
            width, height
        });
    }

    #renderControls() {
        this.#disableButton(this.#$preview, this.#captureControlModel.isPreviewBtnDisabled());
        this.#disableButton(this.#$captureStart, this.#captureControlModel.isCaptureStartBtnDisabled());
        this.#disableButton(this.#$captureEnd, this.#captureControlModel.isCaptureEndBtnDisabled());

        const isAutoStartDelayDisabled = this.#captureControlModel.isAutoStartDelayDisabled();
        this.#$useAutoStart.disabled = isAutoStartDelayDisabled;
        this.#$autoStartDelaySelection.disabled = isAutoStartDelayDisabled;

        const isVideoSizeSelectionDisabled = this.#captureControlModel.isVideoSizeSelectionDisabled();
        this.#$videoSizeSelection.disabled = isVideoSizeSelectionDisabled;
        this.#$videoWidth.disabled = isVideoSizeSelectionDisabled;
        this.#$videoHeight.disabled = isVideoSizeSelectionDisabled;
        this.#$videoSizeAdjustmentMethod.forEach($elem => $elem.disabled = isVideoSizeSelectionDisabled);

        this.#$videoLengthSelection.disabled = this.#captureControlModel.isVideoLengthSelectionDisabled();

        DOM.display(this.#$videoSizeInputArea, this.#captureControlModel.isVideoSizeArbitrary());
        DOM.display(this.#$nowCapturing, this.#captureControlModel.isCapturing());
        DOM.display(this.#$videoSizeAdjustmentMethodArea, !this.#captureControlModel.isVideoSizeDefault());

        this.#renderMessageArea();
    }

    #disableButton($button, isDisabled) {
        $button.classList.remove('is-active');
        $button.classList.remove('is-disabled');

        if (isDisabled) {
            $button.classList.add('is-disabled');
        } else {
            $button.classList.add('is-active');
        }
    }

    #renderMessageArea() {

        const autoStartDelayCount = this.#captureControlModel.getAutoStartDelayCount();
        let message = 0 < autoStartDelayCount ? `録画開始 ${autoStartDelayCount} 秒前` : '';
        message = this.#captureControlModel.isCapturing() ? '録画中は、ブラウザウィンドウを最小化しないでください。' : message;

        let messageStyleClass = !message ? '' : MessageType.remark.styleClass;

        const errorMessage = this.#captureControlModel.getErrorMessage();
        if (errorMessage) {
            message = errorMessage;
            messageStyleClass = MessageType.error.styleClass;
        }
        this.#setMessageToMessageArea(messageStyleClass, message);
    }

    #setMessageToMessageArea(messageStyleClass, message) {
        for (const key in MessageType) {
            this.#$messageArea.classList.remove(MessageType[key].styleClass);    
        }

        if (messageStyleClass) {
            this.#$messageArea.classList.add(messageStyleClass);
        }
        this.#$messageArea.textContent = message;
    }
}
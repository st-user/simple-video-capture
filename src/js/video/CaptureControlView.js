import DOM from '../common/DOM.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import debounce from '../common/Debounce.js';

const PREVIEW_AREA_PADDING = 12;
const PREVIEW_AREA_VIDEO_INFO_HEIGHT = 24;
const videoInfoTemplate = data => {
    return `
        ▼録画対象 [実サイズ：${data.width}x${data.height}]
    `;
};

export default class CaptureControlView {

    #captureControlModel;

    #$preview;
    #$captureStart;
    #$captureEnd;
    #$nowCapturing;

    #$previewArea;
    #$videoInfo;
    #$video;

    #$errorMessageArea;
    #$videoSizeSelection;
    #$videoSizeInputArea;
    #$videoWidth;
    #$videoHeight;

    #$videoLengthSelection;

    constructor(caputureControlModel) {
        this.#captureControlModel = caputureControlModel;

        this.#$preview = DOM.query('#preview');
        this.#$captureStart = DOM.query('#captureStart');
        this.#$captureEnd = DOM.query('#captureEnd');
        this.#$nowCapturing = DOM.query('#nowCapturing');

        this.#$previewArea = DOM.query('#previewArea');
        this.#$videoInfo = DOM.query('#videoInfo');

        this.#$errorMessageArea = DOM.query('#errorMessageArea');
        this.#$videoSizeSelection = DOM.query('#videoSizeSelection');
        this.#$videoSizeInputArea = DOM.query('#videoSizeInputArea');
        this.#$videoWidth = DOM.query('#videoWidth');
        this.#$videoHeight = DOM.query('#videoHeight');

        this.#$videoLengthSelection = DOM.query('#videoLengthSelection');
    }

    setUpEvent() {

        DOM.click(this.#$preview, async () => this.#captureControlModel.preview());
        DOM.click(this.#$captureStart, () => this.#captureControlModel.captureStart());
        DOM.click(this.#$captureEnd, () => this.#captureControlModel.captureEnd());

        const changeVideoSize = () => {
            this.#captureControlModel.changeVideoSize(
                DOM.optionValue(this.#$videoSizeSelection),
                this.#$videoWidth.value,
                this.#$videoHeight.value
            );
        };
        DOM.change(this.#$videoSizeSelection, changeVideoSize);

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

        changeVideoSize();
        changeVideoLength();
        this.#renderVideo();
        this.#renderControls();
    }

    #renderVideo() {
        if (this.#$video) {
            this.#$video.remove();
            this.#$video = undefined;
        }
        if (!this.#captureControlModel.getStream()) {
            DOM.none(this.#$previewArea);
            return;
        }
        DOM.block(this.#$previewArea);

        const $video = document.createElement('video');
        $video.palysinline = false;
        $video.autoplay = true;
        $video.srcObject = this.#captureControlModel.getStream();
        this.#$video = $video;
        this.#$previewArea.appendChild($video);

        this.#resizeVideo();
    }

    #resizeVideo() {
        if (!this.#$video || !this.#$previewArea) {
            return;
        }
        
        const videoSetting = this.#captureControlModel.getVideoSetting();
        const origAreaClientWidth = window.innerWidth * 0.90;
        const origVideoWidth = videoSetting.width;
        const origVideoWithPadding = origVideoWidth + PREVIEW_AREA_PADDING;

        const applyAspectRatio = width => {
            return width * (1 / videoSetting.aspectRatio);
        };
        const areaWidth = Math.min(origVideoWithPadding, origAreaClientWidth);
        const videoWidth = areaWidth - PREVIEW_AREA_PADDING;
        const videoHeight = applyAspectRatio(videoWidth);
        const adjustedAreaWidth = Math.max(areaWidth, 270);
        const adjustedAreaHeight = applyAspectRatio(adjustedAreaWidth - PREVIEW_AREA_PADDING) + PREVIEW_AREA_PADDING + PREVIEW_AREA_VIDEO_INFO_HEIGHT;

        this.#$video.width = videoWidth;
        this.#$video.height = videoHeight;
        this.#$previewArea.style.width = `${adjustedAreaWidth}px`;
        this.#$previewArea.style.height = `${adjustedAreaHeight}px`;
        this.#$videoInfo.textContent = videoInfoTemplate({
            width: videoSetting.width, height: videoSetting.height
        });
    }

    #renderControls() {
        this.#disableButton(this.#$preview, this.#captureControlModel.isPreviewBtnDisabled());
        this.#disableButton(this.#$captureStart, this.#captureControlModel.isCaptureStartBtnDisabled());
        this.#disableButton(this.#$captureEnd, this.#captureControlModel.isCaptureEndBtnDisabled());

        const isVideoSizeSelectionDisabled = this.#captureControlModel.isVideoSizeSelectionDisabled();
        this.#$videoSizeSelection.disabled = isVideoSizeSelectionDisabled;
        this.#$videoWidth.disabled = isVideoSizeSelectionDisabled;
        this.#$videoHeight.disabled = isVideoSizeSelectionDisabled;

        this.#$videoLengthSelection.disabled = this.#captureControlModel.isVideoLengthSelectionDisabled();

        if (this.#captureControlModel.isVideoSizeArbitrary()) {
            DOM.block(this.#$videoSizeInputArea);
        } else {
            DOM.none(this.#$videoSizeInputArea);
        }

        if (this.#captureControlModel.isCapturing()) {
            DOM.block(this.#$nowCapturing);
        } else {
            DOM.none(this.#$nowCapturing);
        }

        this.#$errorMessageArea.textContent = this.#captureControlModel.getErrorMessage();
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
}
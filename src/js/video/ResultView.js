import debounce from '../common/Debounce.js';
import DOM from '../common/DOM.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';


const mediaPropertiesTextTemplate = data => {
    const { width, height, length } = data;
    return `(${width}x${height} 約${length}秒)`;
};

export default class ResultView {

    #resultModel;
    #captureControlModel;

    #$resultArea;

    #$downloadLinkWebm;
    #$playResultWebm;
    #$resultPropertiesWebm;

    #$downloadLinkMovieGif;
    #$createResultMovieGif;
    #$playResultMovieGif;
    #$recreateResultMovieGif
    #$resultPropertiesMovieGif;

    #$movieGifOptionSize;
    #$movieGifOptionSizeText;

    #$movieGifOptionLength;
    #$movieGifOptionLengthText;

    #$movieGifOptionsRemark;

    #$playResultVideoArea;
    #$video;
    #origVideoSize;
    #$movieGif;
    #origMovieGifSize;

    constructor(resultModel, captureControlModel) {

        this.#resultModel = resultModel;
        this.#captureControlModel = captureControlModel;

        this.#$resultArea = DOM.query('#resultArea');

        this.#$downloadLinkWebm = DOM.query('#downloadLinkWebm');
        this.#$playResultWebm = DOM.query('#playResultWebm');
        this.#$resultPropertiesWebm = DOM.query('#resultPropertiesWebm');

        this.#$downloadLinkMovieGif = DOM.query('#downloadLinkMovieGif');
        this.#$createResultMovieGif = DOM.query('#createResultMovieGif');
        this.#$playResultMovieGif = DOM.query('#playResultMovieGif');
        this.#$recreateResultMovieGif = DOM.query('#recreateResultMovieGif');
        this.#$resultPropertiesMovieGif = DOM.query('#resultPropertiesMovieGif');

        this.#$movieGifOptionSize = DOM.query('#movieGifOptionSize');
        this.#$movieGifOptionSizeText = DOM.query('#movieGifOptionSizeText');

        this.#$movieGifOptionLength = DOM.query('#movieGifOptionLength');
        this.#$movieGifOptionLengthText = DOM.query('#movieGifOptionLengthText');

        this.#$movieGifOptionsRemark = DOM.query('#movieGifOptionsRemark');

        this.#$playResultVideoArea = DOM.query('#playResultVideoArea');
    }

    setUpEvent() {

        DOM.click(this.#$downloadLinkWebm, event => {
            if (this.#resultModel.isWebmControlDisabled()) {
                event.preventDefault();
            }
        });

        DOM.click(this.#$playResultWebm, event => {
            event.preventDefault();
            if (!this.#resultModel.isWebmControlDisabled()) {
                this.#resultModel.playWebm();
            }
        });


        DOM.click(this.#$downloadLinkMovieGif, event => {
            event.preventDefault();
            if (!this.#resultModel.isMovieGifDownloadLinkDisabled()) {
                this.#resultModel.downloadMovieGif();
            } 
        });

        DOM.click(this.#$playResultMovieGif, event => {
            event.preventDefault();
            if (!this.#resultModel.isMovieControlDisabled()) {
                this.#resultModel.playMovieGif();
            }
            
        });
        
        DOM.click(this.#$createResultMovieGif, event => {
            event.preventDefault();
            if (!this.#resultModel.isMovieControlDisabled()) {
                this.#captureControlModel.setForceDisabled(true);
                this.#resultModel.createMovieGif();
            }
        });

        DOM.click(this.#$recreateResultMovieGif, event => {
            event.preventDefault();
            if (!this.#resultModel.isMovieControlDisabled()) {
                this.#resultModel.recreateMovieGif();
            }
        });

        DOM.change(this.#$movieGifOptionSize, () => {
            this.#resultModel.setMovieGifSizeScale(this.#$movieGifOptionSize.value);
        });

        DOM.change(this.#$movieGifOptionLength, () => {
            this.#resultModel.setMovieGifLength(this.#$movieGifOptionLength.value);
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__START_PREVIEW, () => {
            this.#renderArea();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__RESULT_AREA_STATE_CHANGE, () => {
            this.#renderArea();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__MOVIE_GIF_CREATED, () => {
            this.#captureControlModel.setForceDisabled(false);
            this.#renderArea();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__RESULT_DATA_CREATED, event => {
            const { blob, elapsedMillis, size } = event.detail;
            this.#resultModel.setResult(blob, elapsedMillis, size);
            this.#renderArea();
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO, event => {
            const { objectURL, movieGif } = event.detail;
            if (objectURL) {
                this.#renderVideo(objectURL);
            }
            if (movieGif) {
                this.#renderMovieGif(movieGif);
            }
        });

        CommonEventDispatcher.on(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION, () => {
            this.#renderMovieGifOption();
        });

        window.addEventListener('resize', debounce(() => {
            this.#resizeVideo();
            this.#resizeMovieGif();
        }, 500));

        this.#renderArea();
    }

    #renderArea() {
        if (this.#resultModel.resultExists()) {
            DOM.block(this.#$resultArea);
        } else {
            DOM.none(this.#$resultArea);
            DOM.none(this.#$playResultVideoArea);
            if (this.#$video) {
                this.#$video.remove();
            }
            if (this.#$movieGif) {
                this.#$movieGif.remove();
            }
            return;
        }

        this.#renderWebmArea();
        this.#renderMovieGifArea();
        this.#renderMovieGifOption();
    }

    #renderWebmArea() {
        if (!this.#resultModel.resultExists()) {
            return;
        }
        this.#$downloadLinkWebm.textContent = this.#resultModel.getWebmFilename();
        this.#$downloadLinkWebm.href = this.#resultModel.getObjectURL();
        this.#$downloadLinkWebm.download = this.#resultModel.getWebmFilename();
        
        this.#$resultPropertiesWebm.textContent = mediaPropertiesTextTemplate(this.#resultModel.getWebmAttr());

        this.#disableControl(this.#$downloadLinkWebm, this.#resultModel.isWebmControlDisabled());
        this.#disableControl(this.#$playResultWebm, this.#resultModel.isWebmControlDisabled());
    }

    #renderMovieGifArea() {
        if (!this.#resultModel.resultExists()) {
            return;
        }

        this.#$downloadLinkMovieGif.textContent = this.#resultModel.getMovieGifFilename();
        this.#$downloadLinkMovieGif.href = '#';
        this.#$downloadLinkMovieGif.download = this.#resultModel.getMovieGifFilename();

        if (this.#resultModel.isMovieGifCreated()) {
            DOM.none(this.#$createResultMovieGif);
            DOM.block(this.#$playResultMovieGif);
            DOM.block(this.#$recreateResultMovieGif);

            const { width, height } = this.#resultModel.getMovieGifSizeAttr();
            const { value } = this.#resultModel.getMovieGifLengthAttr();

            this.#$resultPropertiesMovieGif.textContent = mediaPropertiesTextTemplate({
                width, height, length: value
            });

        } else {
            DOM.block(this.#$createResultMovieGif);
            DOM.none(this.#$playResultMovieGif);
            DOM.none(this.#$recreateResultMovieGif);
        }

        this.#disableControl(this.#$downloadLinkMovieGif, this.#resultModel.isMovieGifDownloadLinkDisabled());
        this.#disableControl(this.#$createResultMovieGif, this.#resultModel.isMovieControlDisabled());
        this.#disableControl(this.#$playResultMovieGif, this.#resultModel.isMovieControlDisabled());
        this.#disableControl(this.#$recreateResultMovieGif, this.#resultModel.isMovieControlDisabled());
    }

    #renderMovieGifOption() {
        if (!this.#resultModel.resultExists()) {
            return;
        }

        const movieGifSizeAttr = this.#resultModel.getMovieGifSizeAttr();
        this.#$movieGifOptionSize.value = movieGifSizeAttr.value;
        this.#$movieGifOptionSizeText.textContent = `${movieGifSizeAttr.width}x${movieGifSizeAttr.height}`;
        this.#$movieGifOptionSize.disabled = this.#resultModel.isMovieGifOptionsDisabled();
        this.#disableControl(this.#$createResultMovieGif, this.#resultModel.isMovieGifOptionsDisabled());

        const movieGifLengthAttr = this.#resultModel.getMovieGifLengthAttr();
        this.#$movieGifOptionLength.setAttribute('max', movieGifLengthAttr.max);
        this.#$movieGifOptionLength.value = movieGifLengthAttr.value;
        this.#$movieGifOptionLengthText.textContent = `${movieGifLengthAttr.value}秒`;
        this.#$movieGifOptionLength.disabled = this.#resultModel.isMovieGifOptionsDisabled();
        this.#disableControl(this.#$movieGifOptionLength, this.#resultModel.isMovieGifOptionsDisabled());
    
        if (this.#resultModel.isMovieGifCreated()) {
            DOM.block(this.#$movieGifOptionsRemark);
        } else {
            DOM.none(this.#$movieGifOptionsRemark);
        }
    }

    #renderVideo(objectURL) {
        DOM.block(this.#$playResultVideoArea);
        if (this.#$movieGif) {
            this.#$movieGif.remove();
        }
        if (!this.#$video) {
            this.#$video = document.createElement('video');
            this.#$video.addEventListener('loadedmetadata', () => {
                this.#origVideoSize = {
                    width: this.#$video.videoWidth,
                    height: this.#$video.videoHeight
                };
                this.#resizeVideo();
                this.#$playResultVideoArea.appendChild(this.#$video);
            });
        }
        this.#$video.autoplay = true;
        this.#$video.playsinline = false;
        this.#$video.src = objectURL;
        this.#$video.controls = true;
    }

    #renderMovieGif(movieGif) {
        DOM.block(this.#$playResultVideoArea);
        if (this.#$video) {
            this.#$video.remove();
        }
        if (!this.#$movieGif) {
            this.#$movieGif = document.createElement('img');
            this.#$movieGif.style.display = 'block';
        }
        const { width, height } = this.#resultModel.getMovieGifSizeAttr();
        this.#origMovieGifSize = {};
        this.#origMovieGifSize.width = width;
        this.#origMovieGifSize.height = height;

        this.#$movieGif.src = movieGif;
        this.#$playResultVideoArea.appendChild(this.#$movieGif);
        this.#resizeMovieGif();
    }

    #resizeVideo() {
        this.#resizeMedia(this.#$video, this.#origVideoSize);
    }

    #resizeMovieGif() {
        this.#resizeMedia(this.#$movieGif, this.#origMovieGifSize);
    }

    #resizeMedia($elem, origSize) {
        if (!$elem || !origSize) {
            return;
        }

        const aspectRatio = origSize.width / origSize.height;
        const width = Math.min(window.innerWidth * 0.9, origSize.width);
        const height = width * (1 / aspectRatio);

        $elem.style.width = `${width}px`;
        $elem.style.height = `${height}px`;
    }

    #disableControl($button, isDisabled) {
        $button.classList.remove('is-active');
        $button.classList.remove('is-disabled');

        if (isDisabled) {
            $button.classList.add('is-disabled');
        } else {
            $button.classList.add('is-active');
        }
    }
}
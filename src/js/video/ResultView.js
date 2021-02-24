import debounce from '../common/Debounce.js';
import DOM from '../common/DOM.js';
import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';


export default class ResultView {

    #resultModel;

    #$resultArea;

    #$downloadLinkWebm;
    #$playResultWebm;

    #$downloadLinkMovieGif;    
    #$playResultMovieGif;

    #$movieGifOptionSize;
    #$movieGifOptionSizeText;

    #$movieGifOptionLength;
    #$movieGifOptionLengthText;

    #$playResultVideoArea;
    #$video;
    #origVideoSize;
    #$movieGif;
    #origMovieGifSize;

    constructor(resultModel) {

        this.#resultModel = resultModel;

        this.#$resultArea = DOM.query('#resultArea');

        this.#$downloadLinkWebm = DOM.query('#downloadLinkWebm');
        this.#$playResultWebm = DOM.query('#playResultWebm');

        this.#$downloadLinkMovieGif = DOM.query('#downloadLinkMovieGif');
        this.#$playResultMovieGif = DOM.query('#playResultMovieGif');

        this.#$movieGifOptionSize = DOM.query('#movieGifOptionSize');
        this.#$movieGifOptionSizeText = DOM.query('#movieGifOptionSizeText');

        this.#$movieGifOptionLength = DOM.query('#movieGifOptionLength');
        this.#$movieGifOptionLengthText = DOM.query('#movieGifOptionLengthText');

        this.#$playResultVideoArea = DOM.query('#playResultVideoArea');
    }

    setUpEvent() {

        DOM.click(this.#$downloadLinkMovieGif, event => {
            event.preventDefault();
            this.#resultModel.downloadMovieGif();
        });

        DOM.click(this.#$playResultWebm, () => this.#resultModel.playWebm());
        DOM.click(this.#$playResultMovieGif, () => this.#resultModel.playMovieGif());

        DOM.change(this.#$movieGifOptionSize, () => {
            this.#resultModel.setMovieGifSizeScale(this.#$movieGifOptionSize.value);
        });

        DOM.change(this.#$movieGifOptionLength, () => {
            this.#resultModel.setMovieGifLength(this.#$movieGifOptionLength.value);
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
            return;
        }

        this.#$downloadLinkWebm.textContent = this.#resultModel.getWebmFilename();
        this.#$downloadLinkWebm.href = this.#resultModel.getObjectURL();
        this.#$downloadLinkWebm.download = this.#resultModel.getWebmFilename();

        this.#$downloadLinkMovieGif.textContent = this.#resultModel.getMovieGifFilename();
        this.#$downloadLinkMovieGif.href = '#';
        this.#$downloadLinkMovieGif.download = this.#resultModel.getMovieGifFilename();

        this.#renderMovieGifOption();
    }

    #renderMovieGifOption() {
        if (!this.#resultModel.resultExists()) {
            return;
        }

        const movieGifSizeAttr = this.#resultModel.getMovieGifSizeAttr();
        this.#$movieGifOptionSize.value = movieGifSizeAttr.value;
        this.#$movieGifOptionSizeText.textContent = `${movieGifSizeAttr.width}x${movieGifSizeAttr.height}`;

        const movieGifLengthAttr = this.#resultModel.getMovieGifLengthAttr();
        this.#$movieGifOptionLength.setAttribute('max', movieGifLengthAttr.max);
        this.#$movieGifOptionLength.value = movieGifLengthAttr.value;
        this.#$movieGifOptionLengthText.textContent = `${movieGifLengthAttr.value}秒`;
    }

    #renderVideo(objectURL) {
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
        if (this.#$video) {
            this.#$video.remove();
        }
        if (!this.#$movieGif) {
            this.#$movieGif = document.createElement('img');
            this.#$movieGif.style.display = 'block';
            this.#$playResultVideoArea.appendChild(this.#$movieGif);
        }
        const { width, height } = this.#resultModel.getMovieGifSizeAttr();
        this.#origMovieGifSize = {};
        this.#origMovieGifSize.width = width;
        this.#origMovieGifSize.height = height;
        this.#$movieGif.src = movieGif;
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
}
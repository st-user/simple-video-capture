import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
const gifshot = require('gifshot');

export default class ResultModel {


    #objectURL;
    #blob;
    #filenameWithoutExt;

    #movieGif;

    #movieGifSizeScale;
    #movieGifLength;
    #movieGifLengthMax;

    #webmSize;

    constructor() {
        this.#filenameWithoutExt = 'capture';
        this.#movieGifSizeScale = 1;
        this.#movieGifLength = 10;
    }

    setResult(blob, elapsedMillis, size) {
        // this.#blob = blob;
        this.#objectURL = URL.createObjectURL(blob);
        this.#movieGifLengthMax = Math.min(10, Math.ceil(elapsedMillis / 1000));
        this.#movieGifLength = this.#movieGifLengthMax;
        this.#webmSize = size;
    }

    destroy() {

    }

    resultExists() {
        return !!this.#objectURL;
    }

    getObjectURL() {
        return this.#objectURL;
    }

    getMovieGif() {
        return this.#movieGif;
    }

    getWebmFilename() {
        return this.#filenameWithoutExt + '.webm';
    }

    getMovieGifFilename() {
        return this.#filenameWithoutExt + '.gif';
    }

    getMovieGifSizeAttr() {
        const mul = 1 / (10 / this.#movieGifSizeScale);
        const { width, height } = this.#webmSize;
        return {
            value: this.#movieGifSizeScale,
            width: Math.floor(width * mul),
            height: Math.floor(height * mul)
        };
    }

    getMovieGifLengthAttr() {
        return {
            max: this.#movieGifLengthMax,
            value: this.#movieGifLength
        };
    }

    playWebm() {
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO, {
            objectURL: this.#objectURL
        });
    }

    playMovieGif() {
        if (!this.#movieGif) {
            this.#createMovieGif(() => {
                CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO, {
                    movieGif: this.#movieGif
                });
            });
        } else {
            CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO, {
                movieGif: this.#movieGif
            });
        }
    }

    downloadMovieGif() {
        const download = () => {
            const anchor = document.createElement('a');
            anchor.href = this.#movieGif;
            anchor.download = this.getMovieGifFilename();
            anchor.click();
        };
        if (!this.#movieGif) {
            this.#createMovieGif(() => {
                download();
            });
        } else {
            download();
        }
    }

    setMovieGifSizeScale(scale) {
        this.#movieGifSizeScale = parseInt(scale, 10);
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION);
    }

    setMovieGifLength(length) {
        this.#movieGifLength = parseInt(length, 10);
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION);
    }

    #createMovieGif(callback) {
        if(!confirm('画像gifの生成には数秒から数十秒ほど時間がかかり、PCにそれなりの負荷がかかります。画像gifを生成してもよろしいですか？')) {
            return;
        }

        const size = this.getMovieGifSizeAttr();
        gifshot.createGIF({
            'video': [ this.#objectURL ],
            gifWidth: size.width,
            gifHeight: size.height,
            interval: 0.1,
            numFrames: 10 * this.#movieGifLength,
            frameDuration: 1,
            sampleInterval: 10,
            numWorkers: 2
        }, obj => {
            if (!obj.error) {
                const image = obj.image;
                this.#movieGif = image;
                callback();
            }
        });
    }
}
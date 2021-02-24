import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';
const gifshot = require('gifshot');

export default class ResultModel {

    #objectURL;
    #filenameWithoutExt;

    #nowCreatingMovieGif;
    #movieGif;

    #movieGifSizeScale;
    #movieGifLength;

    #movieGifLengthMax;

    #webmLength;
    #webmSize;

    constructor() {
        this.#init();
    }

    setResult(blob, elapsedMillis, size) {
        this.#objectURL = URL.createObjectURL(blob);
        this.#webmLength = Math.ceil(elapsedMillis / 1000);
        this.#movieGifLengthMax = Math.min(10, this.#webmLength);
        this.#movieGifLength = this.#movieGifLengthMax;
        this.#webmSize = size;
    }

    confirmToClear() {
        if (!this.resultExists()) {
            return true;
        }

        if (!confirm('録画結果を破棄して、プレビューを開始してもよろしいですか？')) {
            return false;
        }
        this.#init();
        return true;
    }

    #init() {
        if (this.#objectURL) {
            URL.revokeObjectURL(this.#objectURL);
            this.#objectURL = undefined;
        }
        this.#filenameWithoutExt = 'capture';
        this.#webmLength = 0;
        this.#webmSize = undefined;

        this.#initMovieGif();
    }

    #initMovieGif() {
        if (this.#movieGif) {
            URL.revokeObjectURL(this.#movieGif);
            this.#movieGif = undefined;
        }
        this.#nowCreatingMovieGif = false;
        this.#filenameWithoutExt = 'capture';
        this.#movieGifSizeScale = 1;
        this.#movieGifLengthMax = 10;
        this.#movieGifLength = this.#movieGifLengthMax;
    }

    resultExists() {
        return !!this.#objectURL;
    }

    isMovieGifCreated() {
        return !!this.#movieGif;
    }

    isCreatingMovieGif () {
        return this.#nowCreatingMovieGif;
    }

    isWebmControlDisabled() {
        return this.isCreatingMovieGif();
    }

    isMovieGifDownloadLinkDisabled() {
        return this.isCreatingMovieGif() || !this.isMovieGifCreated();
    }

    isMovieControlDisabled() {
        return this.isCreatingMovieGif();
    }

    isMovieGifOptionsDisabled() {
        return this.isCreatingMovieGif() || this.isMovieGifCreated();
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

    getWebmAttr() {
        const { width, height } = this.#webmSize;
        return {
            width, height,
            length: this.#webmLength
        };
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

    downloadMovieGif() {
        const anchor = document.createElement('a');
        anchor.href = this.#movieGif;
        anchor.download = this.getMovieGifFilename();
        anchor.click();
    }


    createMovieGif() {
        if(!confirm('画像gifの作成には数秒から数十秒ほど時間がかかり、PCにそれなりの負荷がかかります。画像gifを作成してもよろしいですか？')) {
            return;
        }
        this.#nowCreatingMovieGif = true;
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
            this.#nowCreatingMovieGif = false;
            if (!obj.error) {
                const image = obj.image;
                this.#movieGif = image;
                CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__MOVIE_GIF_CREATED);
            } else {
                console.log(obj.error);
                alert('画像gif作成中にエラーが発生しました。');
            }
        });

        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__RESULT_AREA_STATE_CHANGE);
    }

    recreateMovieGif() {
        if (!confirm('作成済の画像gifを破棄しますがよろしいですか？')) {
            return;
        }
        this.#initMovieGif();
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__RESULT_AREA_STATE_CHANGE);
    }

    playMovieGif() {
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO, {
            movieGif: this.#movieGif
        });
    }

    setMovieGifSizeScale(scale) {
        this.#movieGifSizeScale = parseInt(scale, 10);
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION);
    }

    setMovieGifLength(length) {
        this.#movieGifLength = parseInt(length, 10);
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION);
    }


}
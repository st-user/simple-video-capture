import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

export default class VideoHandler {

    #stream;
    #defaultSettings = [];
    #mediaRecorder;

    async preview(width, height) {
        try {
            this.#stream = await navigator.mediaDevices.getDisplayMedia({
                audio: false,
                video: true
            });
            this.#defaultSettings = [ ...this.#stream.getTracks().map(t => t.getSettings()) ];
            this.#stream.getTracks().forEach(t => {
                t.addEventListener('ended', () => this.#endTrack());
            });
        } catch (e) {
            console.error(e);
            return false;
        }
        await this.setSize(width, height);
        return true;
    }

    startCapturing(lengthSecond) {
     
        this.#mediaRecorder = new MediaRecorder(this.#stream);

        const chunks = [];
        let timer;
        this.#mediaRecorder.onstop = () => {

            const blob = new Blob(chunks, { 'type': 'video/webm' });
                    
            const anchor = document.createElement('a');
            const objectURL = URL.createObjectURL(blob);
            anchor.href = objectURL;
            anchor.download = 'capture.webm';
            anchor.click();
            URL.revokeObjectURL(objectURL);
    
            this.#stream.getTracks().forEach(t => t.stop());           
            clearTimeout(timer);

            this.#endTrack();
        };
    
        this.#mediaRecorder.ondataavailable = event => {
            chunks.push(event.data);
        };

        if (0 < lengthSecond) {
            timer = setTimeout(() => {
                this.#mediaRecorder.stop();
            }, lengthSecond * 1000);
        }

        this.#mediaRecorder.start();

    }

    stopCapturing() {
        if(!this.#mediaRecorder) {
            return;
        }
        this.#mediaRecorder.stop();
    }

    setSize(width, height) {
        if (!this.#stream) {
            return;
        }
        let constraint = this.#defaultSettings[0];
        if ((width <= 0 || height <= 0) && (constraint.width <= 0 || constraint.height <= 0)) {
            return;
        }

        if (0 < width && 0 < height) {
            constraint = { width: {
                min: width, max: width, ideal: width
            }, height: {
                min: height, max: height, ideal: height
            } };  
        }
        return Promise.all(this.#stream.getTracks().map(t => t.applyConstraints(constraint)));
    }

    getStream() {
        return this.#stream;
    }

    getVideoSetting() {
        if (!this.#stream) {
            return undefined;
        }
        return this.#stream.getTracks().map(t => {
            return t.getSettings();
        })[0];
    }

    #endTrack() {
        this.#stream = undefined;
        this.#mediaRecorder = undefined;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING);
    }
}
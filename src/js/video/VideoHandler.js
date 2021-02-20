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
        } catch (e) {
            console.error(e);
            return false;
        }
        this.setSize(width, height);
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
            
            this.#stream = undefined;
            this.#mediaRecorder = undefined;
            clearTimeout(timer);

            CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING);
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
        if (0 < width && 0 < height) {
            constraint = { width, height };  
        }
        this.#stream.getTracks().forEach(t => {
            t.applyConstraints(constraint);
        });
    }

    getStream() {
        return this.#stream;
    }

    getVideoSetting() {
        if (!this.#stream) {
            return undefined;
        }
        return this.#stream.getTracks().map(t => t.getSettings())[0];
    }
}
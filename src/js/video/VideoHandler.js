import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

const SET_DEFAULT_SETTINGS_RETRY_MAX_COUNT = 20;
const SET_DEFAULT_SETTINGS_RETRY_INTERVAL = 50;

export default class VideoHandler {

    #stream;
    #defaultSettings;
    #mediaRecorder;

    async preview(width, height) {
        try {
            this.#stream = await navigator.mediaDevices.getDisplayMedia({
                audio: false,
                video: true
            });
            let retryCount = 0;
            const setDefaultSettings = () => {
                if (!this.#stream) {
                    return;
                }
                const settings = this.#stream.getTracks().map(t => t.getSettings())[0];
                if (!settings.width || !settings.height) {
                    if (SET_DEFAULT_SETTINGS_RETRY_MAX_COUNT <= retryCount) {
                        console.warn(`Can not get default settings and has retried more than ${SET_DEFAULT_SETTINGS_RETRY_MAX_COUNT} times.`, settings);
                        return;
                    }
                    console.warn(`Can not get default settings`, settings);
                    retryCount++;
                    setTimeout(setDefaultSettings, SET_DEFAULT_SETTINGS_RETRY_INTERVAL);
                    return;
                }
                this.#defaultSettings = settings
            };
            setDefaultSettings();
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

            if (!this.#stream) {
                chunks.length = 0;
                clearTimeout(timer);
                return;
            }

            const blob = new Blob(chunks, { 'type': 'video/webm' });
            chunks.length = 0;
                    
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
        let constraint = this.#defaultSettings;
        if ((width <= 0 || height <= 0) && (!constraint || constraint.width <= 0 || constraint.height <= 0)) {
            return;
        }

        if (0 < width && 0 < height) {
            constraint = { height, width };
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
import { CustomEventNames } from '../common/CustomEventNames.js';
import CommonEventDispatcher from '../common/CommonEventDispatcher.js';

const CHECH_IF_SOURCE_STREAM_TRACK_RESIZED_INTERVAL = 300;

export default class VideoHandler {

    #origStream;
    #mediaRecorder;
    #resizeTimer;
    #requestAnimationFrameId;

    #$baseVideo;
    #videoInitialSize;
    #$videoCanvas;

    #drawImageParams;
    
    async preview(userInputSizeSupplier) {
        try {
            this.#drawImageParams = undefined;
            if (this.#origStream) {
                this.#origStream.getTracks().forEach(t => {
                    t.stop();
                    this.#endTrack();
                });
            }
            this.#origStream = await navigator.mediaDevices.getDisplayMedia({
                audio: false,
                video: true
            });
            let currentSetting = this.#origStream.getTracks()[0].getSettings();

            this.#origStream.getTracks().forEach(t => {
                t.addEventListener('ended', () => this.#endTrack());
            });

            this.#$baseVideo = document.createElement('video');
            this.#$baseVideo.autoplay = true;
            this.#$baseVideo.playsinline = false;
            this.#$baseVideo.srcObject = this.#origStream;

            const checkSourceStreamTrackResized = () => {
                const _currentSettings = this.#origStream.getTracks()[0].getSettings();
                if(currentSetting.width !== _currentSettings.width || currentSetting.height !== _currentSettings.height) {
                    this.#$baseVideo.srcObject = this.#origStream;
                }
                currentSetting = _currentSettings;
                this.#resizeTimer = setTimeout(checkSourceStreamTrackResized, CHECH_IF_SOURCE_STREAM_TRACK_RESIZED_INTERVAL);
            };
            clearTimeout(this.#resizeTimer);
            checkSourceStreamTrackResized();

            this.#$videoCanvas = document.createElement('canvas');
            this.#videoInitialSize = undefined;
            this.#$baseVideo.addEventListener('loadedmetadata', () => {               
                this.adjustVideoCanvasSize(
                    userInputSizeSupplier.width(), userInputSizeSupplier.height(), userInputSizeSupplier.method()
                );
                if (!this.#videoInitialSize) {
                    this.#videoInitialSize = { width: this.#$videoCanvas.width, height: this.#$videoCanvas.height };
                }
                const render = () => {
                    this.#drawImage();
                    this.#requestAnimationFrameId = requestAnimationFrame(render);
                };
                cancelAnimationFrame(this.#requestAnimationFrameId);
                render();

                CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__VIDEO_SIZE_CHANGE);
            });


        } catch (e) {
            this.#endTrack();
            alert('画面の撮影(共有)がキャンセルされました。または、画面の共有がブロックされている可能性があります。');
            console.error(e);
            return false;
        }
        return true;
    }

    isVideoInitailSizeLoaded() {
        return !!this.#videoInitialSize;
    }

    adjustVideoCanvasSize(_userInputWidth, _userInputHeight, method) {
        if (!this.#$baseVideo || !this.#$videoCanvas) {
            return;
        }
        const videoWidth = this.#$baseVideo.videoWidth;
        const videoHeight = this.#$baseVideo.videoHeight;
        const canvasWidth = this.#$videoCanvas.width;
        const canvasHeight = this.#$videoCanvas.height;
        const _size = this.getVideoActualSize(_userInputWidth, _userInputHeight);
        const userInputWidth = _size.width;
        const userInputHeight = _size.height;

        // e.g. 2k screen 2560 x 1440
        const origAspectRatio = videoWidth / videoHeight;

        const userAspectRatio = userInputWidth / userInputHeight;


        let videoFillWidth = this.#$videoCanvas.width;
        let videoFillHeight = this.#$videoCanvas.height;
        let xPadding = 0;
        let yPadding = 0;

        if (method === 'cut') {

            let videoCutWidth = videoWidth;
            let videoCutHeight = videoHeight;
            let xHidden = 0;
            let yHidden = 0;

            const wMag = userInputWidth / videoWidth;
            const hMag = userInputHeight / videoHeight;

            if (hMag < wMag) {
                const fullHeight = videoHeight * wMag;
                const fullHidenHeight = fullHeight - userInputHeight;
                yHidden = (fullHidenHeight / 2) / wMag;
                videoCutHeight = (fullHeight - fullHidenHeight) / wMag;
            }

            if (wMag < hMag) {
                const fullWidth = videoWidth * hMag;
                const fullHidenWidth = fullWidth - userInputWidth;
                xHidden = (fullHidenWidth / 2) / hMag;
                videoCutWidth = (fullWidth - fullHidenWidth) / hMag;
            }

            this.#drawImageParams = {
                xHidden, yHidden, videoCutWidth, videoCutHeight,
                xPadding, yPadding, videoFillWidth, videoFillHeight
            };

        } else {

            if (origAspectRatio < userAspectRatio) {
                // too large width. e.g. 1200 x 600
    
                videoFillWidth = (canvasHeight / videoHeight) * videoWidth;
                xPadding =  (canvasWidth - videoFillWidth) / 2;
        
                // console.log(`${canvasWidth}/${canvasHeight}/${videoFillWidth}/${xPadding}   -- ${videoFillWidth + xPadding * 2}`);
        
            } 
    
            if (userAspectRatio < origAspectRatio) {
                // too large height. e.g. 600 x 600
    
                videoFillHeight = (canvasWidth / videoWidth) * videoHeight;
                yPadding =  (canvasHeight - videoFillHeight) / 2;
        
                // console.log(`${canvasHeight}/${canvasWidth}/${videoFillHeight}/${yPadding}   -- ${videoFillHeight + yPadding * 2}`);
            }

            this.#drawImageParams = {
                xPadding, yPadding, videoFillWidth, videoFillHeight
            };
            
        }

        const displayWidth = Math.min(window.innerWidth * 0.90, userInputWidth);
        const displayHeight = displayWidth * userInputHeight / userInputWidth;

        this.#$videoCanvas.width = userInputWidth;
        this.#$videoCanvas.height = userInputHeight;
        this.#$videoCanvas.style.width = `${displayWidth}px`;
        this.#$videoCanvas.style.height = `${displayHeight}px`;
    }

    getVideoActualSize(_userInputWidth, _userInputHeight) {
        if (!this.#$baseVideo) {
            return;
        }
        const videoWidth = this.#$baseVideo.videoWidth;
        const videoHeight = this.#$baseVideo.videoHeight;
        const width = !_userInputWidth ? videoWidth : _userInputWidth;
        const height = !_userInputHeight ? videoHeight : _userInputHeight;

        return { width, height };
    }

    #drawImage() {
        if (!this.#$baseVideo || !this.#$videoCanvas || !this.#drawImageParams) {
            return false;
        }
        const { 
            xPadding, yPadding, videoFillWidth, videoFillHeight,
            xHidden, yHidden, videoCutWidth, videoCutHeight
        } = this.#drawImageParams;
        const ctx = this.#$videoCanvas.getContext('2d');
        ctx.fillColor = '#000000';
        ctx.fillRect(0, 0, this.#$videoCanvas.width, this.#$videoCanvas.height);

        if (xHidden || yHidden) {
            ctx.drawImage(
                this.#$baseVideo, xHidden, yHidden, videoCutWidth, videoCutHeight,
                xPadding, yPadding, videoFillWidth, videoFillHeight 
            );
        } else {
            ctx.drawImage(this.#$baseVideo, xPadding, yPadding, videoFillWidth, videoFillHeight);
        }
        

        return true;
    }

    startCapturing(lengthSecond) {
     
        this.#mediaRecorder = new MediaRecorder(this.#$videoCanvas.captureStream());

        const chunks = [];
        let timer;
        this.#mediaRecorder.onstop = () => {

            if (!this.#origStream) {
                chunks.length = 0;
                clearTimeout(timer);
                return;
            }

            const blob = new Blob(chunks, { 'type': 'video/webm' });
            chunks.length = 0;           

            const videoToCalcDuration = document.createElement('video');
            const _objectURL = URL.createObjectURL(blob);

            videoToCalcDuration.src = _objectURL;
            videoToCalcDuration.onloadedmetadata = () => {
    
                videoToCalcDuration.currentTime = 7 * 24 * 60 * 1000;
                videoToCalcDuration.onseeked = () => {
                    const elapsedSeconds = videoToCalcDuration.duration;
                    const objectURL = URL.createObjectURL(blob);
                    const size = this.#videoInitialSize;

                    CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__RESULT_DATA_CREATED, {
                        objectURL, elapsedSeconds, size
                    });

                    URL.revokeObjectURL(_objectURL);
                    videoToCalcDuration.onseeked = undefined;
                };
            };
    
            this.#origStream.getTracks().forEach(t => t.stop());           
            clearTimeout(timer);

            this.#endTrack({
                isSuccessCallback: true
            });
        };
    
        this.#mediaRecorder.ondataavailable = event => {
            chunks.push(event.data);
        };
        this.#mediaRecorder.start();
        

        if (0 < lengthSecond) {
            timer = setTimeout(() => {
                if (this.#mediaRecorder) {
                    this.#mediaRecorder.stop();
                }
            }, lengthSecond * 1000 + 1000);
        }
    }

    stopCapturing() {
        if(!this.#mediaRecorder) {
            return;
        }
        this.#mediaRecorder.stop();
    }

    getVideoCanvas() {
        return this.#$videoCanvas;
    }

    #endTrack(eventData) {
        clearTimeout(this.#resizeTimer);
        this.#origStream = undefined;
        
        if (this.#mediaRecorder) {
            if (this.#mediaRecorder.state === 'recording') {
                this.#mediaRecorder.stop();
            }
        }
        this.#mediaRecorder = undefined;
        if(this.#$baseVideo) {
            this.#$baseVideo.remove();
            this.#$baseVideo = undefined;
        }
        if(this.#$videoCanvas) {
            this.#$videoCanvas.remove();
            this.#$videoCanvas = undefined;
        }
        cancelAnimationFrame(this.#requestAnimationFrameId);
        this.#drawImageParams = undefined;
        CommonEventDispatcher.dispatch(CustomEventNames.SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING, eventData);
    }
}
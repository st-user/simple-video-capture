import CaptureControlModel from './video/CaptureControlModel.js';
import CaptureControlView from './video/CaptureControlView.js';


export default async function main() {

    const captureControlModel = new CaptureControlModel();
    const captureControlView = new CaptureControlView(captureControlModel);
    await captureControlView.setUpEvent();
}
import CaptureControlModel from './video/CaptureControlModel.js';
import { CaptureControlState } from './video/CaptureControlState.js';
import CaptureControlView from './video/CaptureControlView.js';


export default function main() {

    const captureControlModel = new CaptureControlModel();
    const captureControlView = new CaptureControlView(captureControlModel);
    captureControlView.setUpEvent();
}
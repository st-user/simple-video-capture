import CaptureControlModel from './video/CaptureControlModel.js';
import CaptureControlView from './video/CaptureControlView.js';
import ExplanationsModel from './video/ExplanationsModel.js';
import ExplanationsView from './video/ExplanationsView.js';

export default function main() {

    const captureControlModel = new CaptureControlModel();
    const explanationsModel = new ExplanationsModel();

    const captureControlView = new CaptureControlView(
        captureControlModel, explanationsModel
    );
    captureControlView.setUpEvent();

    new ExplanationsView(explanationsModel).setUpEvent();
}
import CaptureControlModel from './video/CaptureControlModel.js';
import CaptureControlView from './video/CaptureControlView.js';
import ExplanationsModel from './video/ExplanationsModel.js';
import ExplanationsView from './video/ExplanationsView.js';
import ResultModel from './video/ResultModel.js';
import ResultView from './video/ResultView.js';

export default function main() {

    const captureControlModel = new CaptureControlModel();
    const explanationsModel = new ExplanationsModel();
    const resultModel = new ResultModel();

    const captureControlView = new CaptureControlView(
        captureControlModel, explanationsModel
    );
    captureControlView.setUpEvent();

    new ExplanationsView(explanationsModel).setUpEvent();
    new ResultView(resultModel).setUpEvent();
}
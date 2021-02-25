import CaptureControlModel from './video/CaptureControlModel.js';
import CaptureControlView from './video/CaptureControlView.js';
import ExplanationsModel from './video/ExplanationsModel.js';
import ExplanationsView from './video/ExplanationsView.js';
import MainNoticeModel from './video/MainNoticeModel.js';
import MainNoticeView from './video/MainNoticeView.js';
import ResultModel from './video/ResultModel.js';
import ResultView from './video/ResultView.js';

export default function main() {

    const mainNoticeModel = new MainNoticeModel();
    const captureControlModel = new CaptureControlModel();
    const explanationsModel = new ExplanationsModel();
    const resultModel = new ResultModel();

    const captureControlView = new CaptureControlView(
        captureControlModel, mainNoticeModel, explanationsModel, resultModel
    );
    captureControlView.setUpEvent();

    new ExplanationsView(explanationsModel).setUpEvent();
    new MainNoticeView(mainNoticeModel).setUpEvent();
    new ResultView(resultModel, captureControlModel).setUpEvent();
}
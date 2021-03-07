import { HeaderView, ExplanationsView } from 'vncho-lib';

import { CustomEventNames } from './common/CustomEventNames.js';
import CaptureControlModel from './video/CaptureControlModel.js';
import CaptureControlView from './video/CaptureControlView.js';
import MainNoticeModel from './video/MainNoticeModel.js';
import MainNoticeView from './video/MainNoticeView.js';
import ResultModel from './video/ResultModel.js';
import ResultView from './video/ResultView.js';

const headerConfig  = {
    containerSelector: '#headerArea',
    title: '簡単動画キャプチャーツール',
    remarkAboutBrowser: `ブラウザは、Google Chrome, Firefox, Microsoft Edge(Chromium版)の、できるだけ最新に近いバージョンを使用してください。
    これら意外のブラウザでは動作しない可能性があります。`
};

const expanationsConfig = {
    eventName: CustomEventNames.SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS
};

export default function main() {

    const mainNoticeModel = new MainNoticeModel();
    const captureControlModel = new CaptureControlModel();
    const resultModel = new ResultModel();

    new HeaderView(headerConfig);

    const captureControlView = new CaptureControlView(
        captureControlModel, mainNoticeModel, resultModel
    );
    captureControlView.setUpEvents();

    new ExplanationsView(expanationsConfig).setUpEvents();
    new MainNoticeView(mainNoticeModel).setUpEvents();
    new ResultView(resultModel, captureControlModel).setUpEvents();
}
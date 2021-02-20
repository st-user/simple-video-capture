const CaptureControlState = {
    BEFORE_PREVIEW: 0,
    READY_TO_CAPTURE: 1,
    CAPTURING: 2
};

const VideoSizeDef = {
    '2k': { width: 2560, height: 1440 },
    'fullHd': { width: 1920, height: 1080 },
    'hd': { width: 1280, height: 720 }
};

export { CaptureControlState, VideoSizeDef };
const createNames = () => {
    const names = {
        set: (key, value) => {
            Object.keys(names).forEach(existingKey => {
                if (existingKey === key) {
                    throw `CustomEventNamesのキーが重複しています : ${key}`;
                }
            });
            Object.values(names).forEach(existingValue => {
                if (existingValue === value) {
                    throw `CustomEventNamesの値が重複しています : ${value}`;
                }
            });
            names[key] = value;
            return names;
        }
    };
    return names;
};

const CustomEventNames = createNames();
const CustomEventContextNames = createNames();

CustomEventNames
    .set('SIMPLE_VIDEO_CAPTURE__CONTROL_STATE_CHANGE', 'simple-video-capture/control-state-change')
    .set('SIMPLE_VIDEO_CAPTURE__VIDEO_SIZE_CHANGE', 'simple-video-capture/video-size-change')
    .set('SIMPLE_VIDEO_CAPTURE__START_PREVIEW', 'simple-video-capture/start-preview')
    .set('SIMPLE_VIDEO_CAPTURE__START_CAPTURING', 'simple-video-capture/start-capturing')
    .set('SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING', 'simple-video-capture/stop-capturing')

;

export { CustomEventNames, CustomEventContextNames };

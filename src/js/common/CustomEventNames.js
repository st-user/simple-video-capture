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
    .set('SIMPLE_VIDEO_CAPTURE__COUNT_DOWN_TO_START_CAPTURING', 'simple-video-capture/count-down-to-start-capturing')
    .set('SIMPLE_VIDEO_CAPTURE__STOP_CAPTURING', 'simple-video-capture/stop-capturing')
    .set('SIMPLE_VIDEO_CAPTURE__TOGGLE_EXPLANATIONS', 'simple-video-capture/toggle-explanations')
    .set('SIMPLE_VIDEO_CAPTURE__RESULT_AREA_STATE_CHANGE', 'simple-video-capture/result-area-state-change')
    .set('SIMPLE_VIDEO_CAPTURE__RESULT_DATA_CREATED', 'simple-video-capture/result-data-created')
    .set('SIMPLE_VIDEO_CAPTURE__PLAY_RESULT_VIDEO', 'simple-video-capture/play-result-video')
    .set('SIMPLE_VIDEO_CAPTURE__MOVIE_GIF_CREATED', 'simple-video-capture/movie-gif-created')
    .set('SIMPLE_VIDEO_CAPTURE__CHANGE_MOVIE_GIF_OPTION', 'simple-video-capture/change-movie-gif-option')

;

export { CustomEventNames, CustomEventContextNames };

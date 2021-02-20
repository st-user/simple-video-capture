const debounce = (func, wait) => {
    let timeout;

    return function() {
        const context = this, thisArgs = arguments;
        const execute = () => {
            timeout = null;
            func.apply(context, thisArgs);
        };
        clearTimeout(timeout);
        timeout = setTimeout(execute, wait);
    };
};

export default debounce;

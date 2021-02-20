const checkIfInputValueEmpty = errorMsg => {
    return inputValue => !inputValue ? errorMsg : '';
};

const checkIfInputValueMatchesRegExp = (regExp, errorMsg, invert) => {
    return inputValue => {
        let result;
        if (!invert) {
            result = regExp.test(inputValue);
        } else {
            result = !regExp.test(inputValue);
        }
        return result ? errorMsg : '';
    };
};

const checkAll = (inputValue, checkers) => {
    let error = '';
    checkers.forEach(ch => error = error || ch(inputValue));
    return error;
};

const checkIfIntegerGreaterEqual = (value, errorMsg) => {
    return inputValue => value < parseInt(inputValue, 10) ? '' : errorMsg;
};

export {
    checkIfInputValueEmpty,
    checkIfInputValueMatchesRegExp,
    checkIfIntegerGreaterEqual,
    checkAll
};

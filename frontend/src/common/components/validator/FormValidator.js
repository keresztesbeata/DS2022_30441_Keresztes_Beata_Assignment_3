const minLengthValidator = (value, minLength) => {
    return value.length >= minLength;
};

// check if the string contains invalid characters
const invalidCharacterValidator = value => {
    return /[^ `!@#$%^&*()_+\-={};':"\\|,.<>?~]/.test(value);
};

// check if the string contains any digits
const containsDigitValidator = value => {
    return /\d/.test(value);
};

const uuidValidator = value => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$|/.test(value);
}

const validate = (value, rules) => {
    let isValid = true;

    for (let rule in rules) {

        switch (rule) {
            case 'minLength':
                isValid = isValid && minLengthValidator(value, rules[rule]);
                break;

            case 'checkInvalidCharacters':
                isValid = isValid && invalidCharacterValidator(value, rules[rule]);
                break;

            case 'hasDigit':
                isValid = isValid && containsDigitValidator(value);
                break;

            case 'isUUID':
                isValid = isValid && uuidValidator(value);
                break;

            default:
                isValid = true;
        }

    }

    return isValid;
};

export default validate;

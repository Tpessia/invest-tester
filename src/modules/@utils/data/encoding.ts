export function hash(str: string) {
    if (str == null || str == '') return '';
    let hashStr = 0;
    for (let character of str) {
        let charCode = character.charCodeAt(0);
        hashStr = hashStr << 5 - hashStr;
        hashStr += charCode;
        hashStr |= hashStr;
    }
    return hashStr.toString();
}

export function parseJwt(token: string) {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
}

export function tryParseJwt(token: string, warn: boolean = true) {
    try {
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
        if (warn) console.warn(err);
        return null;
    }
}

export function friendlyName(name, handle) {
    if (!!name && name.length > 0) {
        return name;
    }
    return handle ?? "Ghost";
}

export function avatarFallback(name) {
    if (name.length == 0) {
        return "";
    }
    return String.fromCodePoint(name.codePointAt(0)).toUpperCase();
}


export const wkGhostButton = "rt-reset rt-BaseButton rt-Button rt-r-size-2 rt-variant-ghost";

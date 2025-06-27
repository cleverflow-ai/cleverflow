const hiddenChar = "\u2063";
const zeroWidthSpace = "\u200B"; // U+200B Zero Width Space
const zeroWidthNoBreak = "\uFEFF"; // U+FEFF Zero Width No-Break Space

export function fixJsonString(jsonString: string) {
    try {
        // return jsonString;
        return jsonString.replace(/\n\s+/g, '\\n').trim();
    } catch (error) {
        console.error("JSON Parse Error:", error);
        return null;
    }
}

export function hideLineBreak(jsonString: string) {
    return jsonString.replace(/\n/g, hiddenChar);
}

export function showLineBreak(jsonString: string) {
    return jsonString.replace(new RegExp(hiddenChar, "g"), "\n");
}

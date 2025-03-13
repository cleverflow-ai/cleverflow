export function fixJsonString(jsonString: string) {
    try {
        return jsonString.replace(/\n\s+/g, '\\n').trim();
    } catch (error) {
        console.error("JSON Parse Error:", error);
        return null;
    }
}

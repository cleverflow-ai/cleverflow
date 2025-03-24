import _ from 'lodash';

function getNode(
    template: string,
    nodeName: string,
): string | null {
    // Convert attributes array into a regex-friendly pattern
    const attributes: string[] = [];
    const attrPattern = attributes.length
        ? attributes.map(attr => `(?=.*${attr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`).join("")
        : ".*?"; // If empty, match any occurrence of the node

    // Regex pattern to correctly match the node with optional attributes
    const regex = new RegExp(
        `{%\\s*${nodeName}([^%]*)${attrPattern}\\s*%}` + // Opening tag (with attributes)
        `([\\s\\S]*?)` + // Capture node content
        `{%\\s*/${nodeName}\\s*%}`, // Closing tag
        "g"
    );

    // Find the first match
    const match = regex.exec(template);
    return match ? match[0] : null; // Return full node content (or null if not found)
}


function getNodes(template: string, nodeName: string): string[] {
    const nodes: string[] = [];

    // Regex to find all occurrences of the node
    const regex = new RegExp(
        `{%\\s*${nodeName}[^%]*%}` + // Match opening tag
        `([\\s\\S]*?)` + // Capture content inside the node
        `{%\\s*/${nodeName}\\s*%}`, // Match closing tag
        "gi" // Case-insensitive, global match
    );

    let match;
    while ((match = regex.exec(template)) !== null) {
        nodes.push(match[0]); // Push full node content into the array
    }

    return nodes;
}

function extractAttributes(nodeString: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Match the opening tag
    const tagMatch = nodeString.match(/{%\s*([\w-]+)\s+([^%]+)%}/);
    if (!tagMatch) return attributes; // Return empty if no valid node found

    const attrString = tagMatch[2]; // Get attribute part

    // Regex to match key="value" or key=value
    const attrRegex = /(\w+)=["']?([^"']+)["']?/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        attributes[match[1]] = match[2];
    }

    return attributes;
}



function insertNodeContent(
    template: string,
    nodeName: string,
    attributes: string[],
    content: string
): string {
    // Convert attributes array into a regex pattern to match the node
    const attributesPattern = attributes.map(attr => `\\s+${attr}`).join("");

    // Regular expression to match the node with attributes
    const regex = new RegExp(
        `{%\\s*${nodeName}${attributes.length ? attributesPattern : ""}\\s*%}([\\s\\S]*?){%\\s*/${nodeName}\\s*%}`,
        "i"
    );

    // Replace the existing content inside the node with the new content
    return template.replace(regex, `{% ${nodeName} ${attributes.join(" ")} %}\n${content}\n{% /${nodeName} %}`);
}

function removeNode(template: string, nodeName: string, attributes: string[] = []): string {
    // Convert attributes array into a regex pattern to match the node
    const attributesPattern = attributes.map(attr => `\\s+${attr}`).join("");

    // Regular expression to match the entire node (including its content)
    const regex = new RegExp(
        `{%\\s*${nodeName}${attributes.length ? attributesPattern : ""}\\s*%}([\\s\\S]*?){%\\s*/${nodeName}\\s*%}\\n?`,
        "gi"
    );

    // Replace the node (remove it from the template)
    return template.replace(regex, "");
}

export function addNode(
    template: string,
    parentNode: string,
    newNode: string,
    attributes: string[] = [],
    content: string = "",
    position: "start" | "end" = "end"
): string {
    // Construct attribute selector for parent node
    const parentAttributes: string[] = [];
    const parentAttrPattern = parentAttributes.length
        ? parentAttributes.map(attr => `(?=.*${attr})`).join("")
        : ""; // If no attributes, match any parent node

    // Regex pattern to find the parent node block
    const regex = new RegExp(
        `({%\\s*${parentNode}[^%]*${parentAttrPattern}\\s*%})` + // Opening tag
        `([\\s\\S]*?)` + // Content (non-greedy match)
        `({%\\s*/${parentNode}\\s*%})`, // Closing tag
        "g"
    );

    // Construct new node content
    const attributesString = attributes.length ? " " + attributes.join(" ") : "";
    const newNodeContent = `\n    {% ${newNode}${attributesString} %}\n    ${content}\n    {% /${newNode} %}\n`;

    // Replace the correct parent node's content
    return template.replace(regex, (match, openingTag, innerContent, closingTag) => {
        return position === "start"
            ? `${openingTag}${newNodeContent}${innerContent}${closingTag}`
            : `${openingTag}${innerContent}${newNodeContent}${closingTag}`;
    });
}

export function extractNodeContent(text: string, nodeName: string) {
    const attributes: string[] = [];
    // Convert attributes array into a single regex pattern
    const attributesPattern = attributes.map((attr) => `\\s+${attr}`).join(""); // Ensure spaces between attributes
    const regex = new RegExp(
        `{%\\s*${nodeName}${attributes.length ? attributesPattern : ""}\\s*%}([\\s\\S]*?){%\\s*/${nodeName}\\s*%}`,
        "i",
    );

    const match = text.match(regex);
    return match ? match[1].trim() : null;
}

export function getNodeByName(template: string, nodeName: string) {
    return getNode(template, nodeName);
}

export function getNodeById(template: string, nodeName: string, id: string) {
    const nodeTemplates = getNodes(template, nodeName);
    return _.find(nodeTemplates, (nodeTemplate: string) => {
        const nodeAttributes = extractAttributes(nodeTemplate);
        if (nodeAttributes['id'] === id) {
            return true;
        }
        return false;
    });
}

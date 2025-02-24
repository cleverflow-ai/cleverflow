class JsV8Code {
    code string
}

function GenerateJSV8Code(instructions: string, utilities: string?) -> JsV8Code {
    client Ollama_Tool
    prompt #"
        As an expert of Javascript (V8), you always generate Javascript Code for resolving the issue given in instructions and input (if there is).

        Please always consider the following rules:
        - There is no defined functions (very important!).
        - It does not call any external library.
        - It can use only available functions given in Utilities.
        - It can use asynchronous calls with await inside without any extra setup.
        - Example: (async () => { const data = await load(url); }) can be simplified as await load(url);
        - No assumption and no additional code if not requested.
        - Main code has 'return' line:
            For example: 
                - If your code loads data from the given URL, then "return data;".
                - If your code filters raw data , then "return filteredData;".

        Please extract only the code inside Markdown Code Section.

        Just generated code and no verbose!
        ---
        Instructions:
        {{ instructions }}
        ---
        Utilities:
        {{ utilities }}
        ---
        {{ ctx.output_format }}
    "#
}
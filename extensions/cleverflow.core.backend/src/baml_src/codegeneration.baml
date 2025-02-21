class JsV8Code {
    code string
}
function GenerateJSV8Code(instructions: string, utilities: string) -> JsV8Code {
    client Ollama_Tool
    prompt #"
        As an expert of Javascript (V8), you consider the given instructions, and generate the corresponding Javascript for them.
        The generated code must be given in pure Javascript:
        - Without using any external library.
        - Without functions.
        - Can call functions given in Utilities.
        - Can use both synchronous and asynchronous calls.

        Please double check the generated code so that it can be copied and run anywhere.
        Please extract only the code inside Markdown Code Section.

        If Instructions requires to return value such as: 'please return the last result',
        then the Code must contain:
            return lastResult;

        Just generated code and no verbose!
        ---
        Instructions:
        {{ instructions }}
        ---
        Instructions:
        {{ utilities }}
        ---
        {{ ctx.output_format }}
    "#
}
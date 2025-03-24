class EchoBack {
    message string
    messageBack string
}

function Echo(message: string) -> EchoBack {
    client Ollama_Default
    prompt #"
        Please return the test echo message back to me:    
        {{ message }}
        ---
        {{ ctx.output_format }}
    "#
}

test Test_Echo {
    functions [Echo]
    args {
        message #"
            Echo echo! Do you hear me?
        "#
    }
}
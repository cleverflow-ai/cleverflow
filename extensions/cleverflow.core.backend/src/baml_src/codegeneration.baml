class JsV8Code {
    code string
}

function GenerateJSV8Code(instructions: string, utilities: string?) -> JsV8Code {
    client Ollama_Code
    prompt #"
        As an expert of Javascript (V8), you always generate Javascript Code for resolving the issue given in instructions.

        Please always consider the following rules:
        - There is no defined functions (very important!).
        - It does not call any external library.
        - It can use only available functions given in Utilities.
        - It can use asynchronous calls with await inside without any extra setup.
        - Example: (async () => { const data = await load(url); }) can be simplified as await load(url);
        - No assumption and no additional code if not requested.
        - If input data is availabe, then declare it in the code as a variable:
            For example:
                - If your code loads data from the given URL, then "const data = await load(url);".
                - If your code filters raw data, then "const data = // data given from instructions;".
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

test Test_GenerateJSV8Code_FilterData {
    functions [GenerateJSV8Code]
    args {
        instructions #"
            Given the Input Data:| Machine Model | Machine Line | Availability | Target Types of Cakes      |
            |---------------|--------------|--------------|----------------------------|
            | Model A1      | Line 1       | Available    | Cupcake, Muffin            |
            | Model B2      | Line 2       | Available    | Cake, Sponge Cake          |
            | Model C3      | Line 3       | Unavailable  | Cheesecake, Brownie        |
            | Model D4      | Line 4       | Available    | Tart, Pie                  |
            | Model E5      | Line 5       | Maintenance  | Cupcake, Cake              |
            | Model F6      | Line 6       | Available    | Sponge Cake, Muffin        |
            | Model G7      | Line 7       | Available    | Cheesecake, Tart           |
            | Model H8      | Line 8       | Unavailable  | Brownie, Pie               |
            | Model I9      | Line 9       | Available    | Cupcake, Cheesecake        |
            | Model J10     | Line 10      | Available    | Muffin, Tart               |
            | Model K11     | Line 11      | Maintenance  | Cake, Brownie              |
            | Model L12     | Line 12      | Available    | Pie, Cheesecake            |
            | Model M13     | Line 13      | Available    | Tart, Sponge Cake          |
            | Model N14     | Line 14      | Unavailable  | Cupcake, Cake              |
            | Model O15     | Line 15      | Available    | Muffin, Brownie            |
            | Model P16     | Line 16      | Available    | Cheesecake, Pie            |
            | Model Q17     | Line 17      | Maintenance  | Tart, Cupcake              |
            | Model R18     | Line 18      | Available    | Sponge Cake, Cake          |
            | Model S19     | Line 19      | Available    | Muffin, Cheesecake         |
            | Model T20     | Line 20      | Unavailable  | Tart, Brownie              |

            Filter the List of Machines for having Availability as 'available'.
        "#
        utilities #"
            log(): void                                     // For printing and debugging purpose.
            load(url: string): Promise<string>              // For downloading or fetching file with a given URL. Usage: await load(...).
            save(url: string, data: string): Promise<void>  // For saving file with a given destination URL. Usage: await save(...).
        "#
    }
}

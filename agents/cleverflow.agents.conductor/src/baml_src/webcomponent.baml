class WebComponent {
  name string
  description string
  uri string
}

function GetWebComponent(content: string, resources: WebComponent[]) -> WebComponent {
    client Ollama_Code
    prompt #"
       You are an intelligent assistant that helps select the **most appropriate** WebComponent from a list of available resources.

        ## Goal:
        Given some **content to display**, choose **exactly one** WebComponent from the list of resources that best matches or supports that content.

        ## Content:
        {{ content }}

        ## Available WebComponent Resources:
        Each resource has the following metadata:
        - `name`: The identifier of the component.
        - `description`: What the component is for or how it's used.
        - `uri`: The location of the component.

        {{ resources }}

        ## Selection Instructions:
        - Choose the **single most relevant** WebComponent for rendering or supporting the given content.
        - If **no resource is a direct match**, select the **most general-purpose or widely applicable** component.
        - Do **not** invent or modify resources. Only choose from the provided list.
        - Base your selection strictly on how well the component supports the described content.

        ## Output Format:
        Respond with the **exact object** (as provided) of the selected WebComponent — nothing more, no explanation.

        ---
        {{ ctx.output_format }}
    "#
}

test Test_GetWebComponent {
    functions [GetWebComponent]
    args {
        content #"
            # Welcome to Our App

            Start managing your projects effortlessly.

            [Get Started](#) {.button}

        "#,
        resources [
            {
                uri "web-component://glb-viewer",
                name "glb-viewer",
                description "Web component that renders GLB 3D models from a URL or base64 data."
            }
            {
                uri "web-component://pdf-viewer",
                name "pdf-viwer",
                description "Web component for viewing PDF file contents."
            }
            {
                uri "web-component://markdoc-viewer",
                name "pdf-viwer",
                description "Web component for viewing Markdoc contents."
            }
        ]
    }
}
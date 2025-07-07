<script lang="ts">
    import { onMount } from "svelte";
    import { SimpleForm } from "@sjsf/form";

    import { resolver } from "@sjsf/form/resolvers/basic";
    import { translation } from "@sjsf/form/translations/en";
    import { theme as skeletonTheme } from "@sjsf/skeleton3-theme";

    let jsonForm = $state({
        type: "object",
        title: "Get File Contents Form",
        properties: {
            url: {
                title: "URL",
                type: "string",
                format: null,
            },
            token: {
                title: "Token",
                type: "string",
                component: "input",
                inputType: "password",
            },
            branch: {
                title: "Branch",
                type: "boolean",
                format: null,
            },
            owner: {
                title: "Owner",
                type: "string",
                format: null,
            },
            repo: {
                title: "Repository",
                type: "string",
                format: null,
            },
            path: {
                title: "Path",
                type: "string",
                format: null,
            },
        },
        required: ["url", "token", "branch", "owner", "repo", "path"],
    });
    let defaultValues = $state({});

    onMount(async () => {});

    const onSubmit = (data: any) => {};
</script>

<SimpleForm
    theme={skeletonTheme}
    {translation}
    {resolver}
    schema={jsonForm}
    initialValue={defaultValues}
    validator={{ isValid: () => true }}
    {onSubmit}
/>

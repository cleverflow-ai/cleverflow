import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: {
                'markdoc-editor': 'src/lib/markdoc/editor/MarkdocEditor.ts',
                'markdoc-renderer': 'src/lib/markdoc/renderer/MarkdocRenderer.ts',
                'markdoc-renderer-controller': 'src/lib/markdoc/renderer/MarkdocRendererController.svelte.ts',
                'b-flow': 'src/lib/bflow/BFlow.ts',
                'b-flow-controller': 'src/lib/bflow/BFlowController.svelte.ts',
            },
            fileName: (format, entryName) => `${entryName}.js`,
            formats: ['es'],

        },
        rollupOptions: {
            output: {
                inlineDynamicImports: false,
            },
        },
        outDir: 'dist-webcomponents',
    },

    plugins: [
        svelte(),
        tailwindcss(),
        paraglide({
            project: "./project.inlang",
            outdir: "./src/lib/paraglide"
        })
    ]
});

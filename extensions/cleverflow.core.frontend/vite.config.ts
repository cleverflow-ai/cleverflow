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
                'markdoc-reader': 'src/lib/markdoc/renderer/MarkdocReader.ts',
                'b-flow': 'src/lib/bflow/BFlow.ts',
                'b-flow-controller': 'src/lib/bflow/BFlowController.svelte.ts',
                'json-form': 'src/lib/dynamicform/JsonForm.ts',
                'file-tree': 'src/lib/filemanager/FileTree.ts',
                'file-controller': 'src/lib/filemanager/FileController.svelte.ts',
                'web-component-loader': 'src/lib/webcomponentloader/WebComponentLoader.ts',
                'glb-loader': 'src/lib/glbloader/GlbLoader.ts'
            },
            fileName: (format, entryName) => `${entryName}.js`,
            formats: ['es'],
        },
        rollupOptions: {
            external: ['@cleverflow-ai/cleverflow.core'],
            output: {
                inlineDynamicImports: true,
            },
        },
        outDir: 'dist-webcomponents',
    },

    plugins: [
        tailwindcss(),
        svelte(),
        paraglide({
            project: "./project.inlang",
            outdir: "./src/lib/paraglide"
        })
    ],
});

import { build, defineConfig } from 'vite';
import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = [
    // { name: 'markdoc-editor', entry: 'src/lib/markdoc/editor/MarkdocEditor.ts' },
    { name: 'markdoc-renderer', entry: 'src/lib/markdoc/renderer/MarkdocRenderer.ts' },
    { name: 'markdoc-renderer-controller', entry: 'src/lib/markdoc/renderer/MarkdocRendererController.svelte.ts' },
    // { name: 'markdoc-reader', entry: 'src/lib/markdoc/renderer/MarkdocReader.ts' },
    // { name: 'b-flow', entry: 'src/lib/bflow/BFlow.ts' },
    // { name: 'b-flow-controller', entry: 'src/lib/bflow/BFlowController.svelte.ts' },
    // { name: 'json-form', entry: 'src/lib/dynamicform/JsonForm.ts' },
    // { name: 'file-tree', entry: 'src/lib/filemanager/FileTree.ts' },
    // { name: 'file-controller', entry: 'src/lib/filemanager/FileController.svelte.ts' },
    // { name: 'web-component-loader', entry: 'src/lib/webcomponentloader/WebComponentLoader.ts' },
    // { name: 'glb-loader', entry: 'src/lib/glbloader/GlbLoader.ts' },
];

async function buildAll() {
    for (const component of components) {
        console.log(`Building: ${component.name}`);
        await build({
            ...defineConfig({
                build: {
                    lib: {
                        entry: path.resolve(__dirname, '..', component.entry),
                        name: component.name,
                        fileName: () => `${component.name}.js`,
                        formats: ['es'],
                    },
                    outDir: 'dist-webcomponents',
                    emptyOutDir: false,
                    rollupOptions: {
                        // external: ['@cleverflow-ai/cleverflow.core'],
                        // preserveEntrySignatures: 'strict',
                        output: {
                            inlineDynamicImports: true,
                        },
                    },
                },
                plugins: [
                    tailwindcss(),
                    svelte(),
                    paraglide({
                        project: "./project.inlang",
                        outdir: "./src/lib/paraglide"
                    })
                ],
            }),
            configFile: false
        });
    }

    console.log("✅ All components built!");
}

buildAll();

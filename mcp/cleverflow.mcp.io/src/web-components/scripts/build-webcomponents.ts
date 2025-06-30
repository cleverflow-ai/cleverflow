import { build, defineConfig } from 'vite';
import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = [
    { name: 'text-viewer', entry: 'src/lib/text-viewer/TextViewer.ts' },
    { name: 'pdf-viewer', entry: 'src/lib/pdf-viewer/PdfViewer.ts' },
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

    console.log("All components built!");
}

buildAll();

import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: {
                'file-uploader': 'src/lib/FileUploader.ts',
            },
            fileName: (format, entryName) => `${entryName}.js`,
            formats: ['es'],
        },
        rollupOptions: {
            external: ['@cleverflow/cleverflow.core'],
            output: {
                inlineDynamicImports: false,
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

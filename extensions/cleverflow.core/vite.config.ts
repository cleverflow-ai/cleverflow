import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/lib/markdoc/MarkdocEditor.ts',
            name: 'markdoc-editor',
            fileName: 'markdoc-editor',
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

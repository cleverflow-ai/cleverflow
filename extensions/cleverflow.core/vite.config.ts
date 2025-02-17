import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: {
                'markdoc-editor': 'src/lib/markdoc/MarkdocEditor.ts',
                'b-flow': 'src/lib/bflow/BFlow.ts',
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

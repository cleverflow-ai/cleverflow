import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'cleverflow.core',
            fileName: 'index',
            formats: ['es'],
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: false,
            },
        },
        outDir: 'dist-vite'
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

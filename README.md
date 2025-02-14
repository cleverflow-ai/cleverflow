## Use InLang / Paraglide for multiple languages

1. Please make sure VS Code Extension `Sherlock - i18n inspector` is installed.

2. Import:
```js
<script>
	import * as m from '$lib/paraglide/messages.js'
</script>
```
See also: https://inlang.com/m/dxnzrydw/paraglide-sveltekit-i18n/getting-started

3. Select any text for extracting, open Command Palette: type `Sherlock: Extract Message`.

4. Open `Sherlock Panel`, find the Message to translate and can use AI for genering the corresponding one in the missing language.

## Add a new Workspace with Web Components (Custom Elements)

1. Add a new Project into `extensions` folder.

2. At the Workspace Project, add the following Build Configuration into `vite.config.ts`:
```ts
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
```
- `src/lib/markdoc/MarkdocEditor.ts`: contains export of Web Component `MarkdocEditor`.
- `dist-webcomponents`: outpout directory of all Web Components, instead of `dist` which is used by `@sveltejs/package` for enabling the reference of Svelte Components across Svelte Projects.

3. At the Workspace Project, change the following Settings of `package.json`:
```json
"files": [
    "dist",
    "!dist/**/*.test.*",
    "!dist/**/*.spec.*",
    "dist-webcomponents"
],
"exports": {
    ".": {
        "types": "./dist/index.d.ts",
        "svelte": "./dist/index.js"
    },
    "./webcomponents/markdoc-editor.js": {
        "import": "./dist-webcomponents/markdoc-editor.js",
        "require": "./dist-webcomponents/markdoc-editor.js"
    }
},
```
- `dist-webcomponents` must be published.
- `./webcomponents/markdoc-editor.js`: each Web Component should have a separate import entry.

See also: https://svelte.dev/docs/kit/packaging

4. At the Main Project, make sure that `dist-webcomponents` folder of each Workspace Project can be found by `vite.config.ts`:
```ts
import { defineConfig, searchForWorkspaceRoot } from 'vite';
...

server: {
    fs: {
        allow: [
            searchForWorkspaceRoot(process.cwd())
        ]
    },
}
```

6. At the Main Project, import Workspace Package via its name and the corresponding entry of Web Component.
```svelte
onMount(async () => {
    await import('@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js');
});
...
<markdoc-editor></markdoc-editor>
```


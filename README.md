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
```
- `src/index.ts`: contains all exports of custom elements.
- `dist-vite`: outpout directory, instead of `dist` which is used by `@sveltejs/package` for enabling the reference of Svelte Components across Svelte Projects.

3. At the Workspace Project, change the following Settings of `package.json`:
```json
"files": [
    "dist",
    "!dist/**/*.test.*",
    "!dist/**/*.spec.*",
    "dist-vite"
],
"svelte": "./dist-vite/index.js",
"types": "./dist/index.d.ts",
"main": "./dist-vite/index.js",
"type": "module",
"exports": {
    ".": {
        "types": "./dist/index.d.ts",
        "svelte": "./dist-vite/index.js",
        "import": "./dist-vite/index.js",
        "require": "./dist-vite/index.js"
    }
},
```

4. At the Main Project, make sure that `dist-vite` folder of each Workspace Project can be found by `vite.config.ts`:
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

5. At the Main Project, disable SSR at `src/routes/+layout.ts`:
```ts
export const ssr = false;
```

6. At the Main Project, import Workspace Package via its name. By default the Main Entry i.e. `dist-vite/index.js` is imported.


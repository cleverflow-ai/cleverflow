<script lang="ts">
    import { onMount } from "svelte";
    import {
        Engine,
        Scene,
        ArcRotateCamera,
        Vector3,
        HemisphericLight,
        SceneLoader,
    } from "@babylonjs/core";
    import "@babylonjs/loaders/glTF";

    let { base64Data } = $props();

    let canvas: HTMLCanvasElement;

    onMount(() => {
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 2.5,
            3,
            Vector3.Zero(),
            scene,
        );
        camera.attachControl(canvas, true);

        new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // 🔁 Decode base64 → Blob
        console.log("base64Data", base64Data.length);
        const binary = atob(base64Data);
        const length = binary.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes.buffer], { type: "model/gltf-binary" });
        const blobUrl = URL.createObjectURL(blob);

        SceneLoader.AppendAsync("", blobUrl, scene, undefined, ".glb").then(
            () => {
                engine.runRenderLoop(() => {
                    scene.render();
                });
            },
        );

        const handleResize = () => engine.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            engine.dispose();
            window.removeEventListener("resize", handleResize);
            URL.revokeObjectURL(blobUrl);
        };
    });
</script>

<canvas bind:this={canvas} style="width: 100%; height: 100%;" />

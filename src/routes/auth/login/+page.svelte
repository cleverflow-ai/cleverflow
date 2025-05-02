<script lang="ts">
    import { onMount } from "svelte";

    const GITEA_URL = "https://gitea-atlascopco-integration.clevernow.com";
    const CLIENT_ID = "b006b4bc-bbd6-46d8-a8aa-90536b754814";
    const CLIENT_SECRET =
        "gto_swuukqmsjark2boij4aybomqhims35w3vlqtqukouxn6peodfvea";
    const REDIRECT_URI = "http://localhost:5173/auth/callback";

    // Function to handle the OAuth2 login process
    function loginWithGitea() {
        const authUrl = `${GITEA_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
            REDIRECT_URI,
        )}&response_type=code&scope=read:user user:email`;
        window.location.href = authUrl; // Redirect to Gitea OAuth2 login
    }
</script>

<main class="flex flex-col items-center justify-center h-screen gap-10">
    <h1 class="h1 text-surface-300">CLEVER°FLOW</h1>
    <div class="w-full flex items-center justify-center gap-10">
        <div
            class="card w-full max-w-md p-8 bg-white rounded shadow-md flex flex-col items-center justify-center gap-10"
        >
            <h2 class="mb-6 text-2xl font-bold text-center text-surface-400">
                Login
            </h2>
            <button
                type="button"
                onclick={loginWithGitea}
                class="btn preset-filled-primary-500 w-full"
            >
                Login with Gitea
            </button>
            <p>Click the button above to log in with Gitea.</p>
        </div>
    </div>
    <div class="h-30"></div>
</main>

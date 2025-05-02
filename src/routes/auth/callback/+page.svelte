<script lang="ts">
    import { onMount } from "svelte";

    const GITEA_URL = "https://gitea-atlascopco-integration.clevernow.com";
    const CLIENT_ID = "b006b4bc-bbd6-46d8-a8aa-90536b754814";
    const CLIENT_SECRET =
        "gto_swuukqmsjark2boij4aybomqhims35w3vlqtqukouxn6peodfvea";
    const REDIRECT_URI = "http://localhost:5173/auth/callback";

    let userData = $state(null);

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");

        if (authCode) {
            handleOAuthCallback();
        }
    });

    async function handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");

        if (authCode) {
            const accessToken = await exchangeCodeForToken(authCode);
            if (accessToken) {
                localStorage.setItem("gitea_access_token", accessToken);
                getUserInfo(accessToken);
            }
        }
    }

    async function exchangeCodeForToken(authCode: string) {
        const response = await fetch(`${GITEA_URL}/login/oauth/access_token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: authCode,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const data = await response.json();
        return data.access_token; // Extract the access token
    }

    async function getUserInfo(accessToken: string) {
        const response = await fetch(`${GITEA_URL}/api/v1/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });

        userData = await response.json();
    }
</script>

<main>
    {#if userData}
        <div id="user-info">
            <h2>Welcome</h2>
            {JSON.stringify(userData)}
        </div>
    {:else}
        <p>Loading user data...</p>
    {/if}
</main>

import GitFilesBrowser from "./GitFilesBrowser.js";

const url = 'https://gitea-atlascopco-integration.clevernow.com/api/v1';
const token = '04f4b0dada8fa8632dc7541f2f2131c703693e7e';
const repo = 'atlascopco-dasm';
const branch = 'main';
const owner = 'clevernow';

(async () => {
    const pattern = 'clevernow/assets/{xd}/*.*';
    // const pattern = 'orders/{orderId}/Documentation/{positionId}/{languageCulture}/{partInfo}/CE_89965.000001_Applicator EAP.30-OO-1050-AW0030.*';
    const gitFileBrowser = new GitFilesBrowser(url, token, branch, owner, repo);
    const result = await gitFileBrowser.run(pattern);
    console.log(result);
})();
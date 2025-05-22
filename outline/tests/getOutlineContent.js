import { getOutlineFileContent } from "../src/index.js";
(async () => {
    const serverUrl = 'https://docs-atlascopco.clevernow.com';
    const apiKey = 'ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO';
    const fileId = 'sealing-technologies-rrOT5m2iSz';
    const result = await getOutlineFileContent(`${serverUrl}/api/documents.info`, apiKey, fileId);
})();

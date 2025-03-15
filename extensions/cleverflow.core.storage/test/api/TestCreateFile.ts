const dotenv = await import('dotenv');
import * as RepositoryService from '../../api/services/RepositoryService.ts';
dotenv.config({ path: '../../.env' });

const result = await RepositoryService.createFile({
    owner: 'admin',
    repo: 'test',
    filePath: 'demo/readme.md',
    fileContent: '### This is a header',
    message: 'Test api.'
});

console.log('>>>> result: ', result);
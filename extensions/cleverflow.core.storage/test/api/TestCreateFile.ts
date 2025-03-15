const dotenv = await import('dotenv');
import * as RepositoryService from '../../api/services/RepositoryService.ts';
dotenv.config({ path: '../../.env' });

const result = await RepositoryService.createFile({
    owner: 'admin',
    repo: 'test',
    filePath: 'demo/subfolder/sub_readme.md',
    fileContent: '### This file in the sub folder.',
});

console.log('>>>> result: ', result);
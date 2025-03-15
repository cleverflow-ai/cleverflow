const dotenv = await import('dotenv');
import * as RepositoryService from '../../api/services/RepositoryService.ts';
import FileMetadata from '../../models/FileMetadata.ts';
dotenv.config({ path: '../../.env' });

const result = await RepositoryService.getFile({
    owner: 'admin',
    repo: 'test',
    filePath: 'demo/readme.md',
});

console.log('>>>> result: ', FileMetadata.getContent(result[0]));
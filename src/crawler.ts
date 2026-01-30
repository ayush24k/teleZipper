import fs from 'fs';
import path from 'path';


export interface FileInfro {
    path: string;
    size: number;
}


// walks folder recursively and returns list of files with their sizes
export async function crawl(target: string, files: FileInfro[] = []): Promise<FileInfro[]> {
    const stats = fs.statSync(target);

    if (stats.isFile()) {
        files.push({path: target, size: stats.size});
        return files;
    }

    const entries = fs.readdirSync(target);

    for (const entry of entries){
        await crawl(path.join(target,entry), files);
    }

    return files;
}
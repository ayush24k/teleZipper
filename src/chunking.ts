import type { FileInfo } from "./crawler";

const CHUNK_SIZE = 48 * 1024 * 1024; // 48 MB


// groups files into chunks where the total size of each chunk does not exceed CHUNK_SIZE
export function chunkFiles(files: FileInfo[]): FileInfo[][] {
    const chunks: FileInfo[][] = [];
    let currentChunk: FileInfo[] = [];
    let currentChunkSize = 0;

    for (const file of files) {
        if (file.size > CHUNK_SIZE) {
            console.warn(`⚠️ Skipping file ${file.path} as it exceeds the maximum size of 48MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
            continue;
        }

        if (currentChunkSize + file.size > CHUNK_SIZE) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkSize = 0;
        }

        currentChunk.push(file);
        currentChunkSize += file.size;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}
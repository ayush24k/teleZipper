import type { FileInfo } from "./crawler";

const CHUNK_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB


// groups files into chunks where the total size of each chunk does not exceed CHUNK_SIZE
export function chunkFiles(files: FileInfo[]): FileInfo[][] {
    const chunks: FileInfo[][] = [];
    let currentChunk: FileInfo[] = [];
    let currentChunkSize = 0;

    for (const file of files) {
        if (file.size > CHUNK_SIZE) {
            throw new Error(`File ${file.path} exceeds the maximum chunk size of 2GB.`);
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
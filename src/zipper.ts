import { FileInfo } from "./crawler";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import archiver from "archiver";
// @ts-ignore - archiver-zip-encrypted doesn't have types
import archiverZipEncrypted from "archiver-zip-encrypted";
import { uploadToTelegram, initTelegramClient } from "./telegramUploader";

// Register the encrypted format
archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

// Helper for serial execution
let uploadQueue = Promise.resolve();
const queueUpload = (action: () => Promise<void>) => {
    const next = uploadQueue.then(action).catch(err => {
        console.error("Queue error:", err);
        throw err;
    });
    uploadQueue = next.catch(() => { }); // Prevent queue from breaking on error, but we still throw for the caller
    return next;
};

export async function zipChunks(
    chunks: FileInfo[][],
    outputDir: string,
    useTelegram: boolean,
    chatId?: string,
    password?: string,
    apiId?: string,
    apiHash?: string
) {
    fs.mkdirSync(outputDir, { recursive: true });

    if (useTelegram) {
        console.log("🔄 Initializing Telegram Client...");
        await initTelegramClient(apiId, apiHash);
    }

    // Process chunks in parallel (Zipping is parallel, Uploading is queued/serial)
    await Promise.all(chunks.map(async (chunk, i) => {
        const zipName = `chunk_${i + 1}.zip`;
        const zipPath = path.join(outputDir, zipName);

        console.log(`📦 Zipping ${zipName} (starting)...`);

        const progressBar = new cliProgress.SingleBar(
            {
                format: `Zipping ${zipName} [{bar}] {percentage}% | {value}/{total} files`,
            },
            cliProgress.Presets.shades_classic
        );

        progressBar.start(chunk.length, 0);

        await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);

            // Use encrypted archiver if password is provided
            const archive = password
                ? archiver("zip-encrypted" as any, {
                    zlib: { level: 9 },
                    encryptionMethod: 'aes256',
                    password: password
                } as any)
                : archiver("zip", { zlib: { level: 9 } });

            archive.pipe(output);

            output.on("close", () => {
                progressBar.stop();
                console.log(`✅ Zipped ${zipName}`);
                resolve();
            });

            archive.on("error", (err) => {
                progressBar.stop();
                reject(err);
            });

            chunk.forEach((file) => {
                archive.file(file.path, { name: path.basename(file.path) });
                progressBar.increment();
            });

            archive.finalize();
        });

        if (useTelegram) {
            // Queue the upload so it happens serially
            await queueUpload(async () => {
                // Random delay between 2 and 5 seconds
                const delay = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
                console.log(`⏳ Waiting ${delay / 1000}s before uploading ${zipName}...`);
                await new Promise((resolve) => setTimeout(resolve, delay));

                await uploadToTelegram(zipPath, chatId);
            });
        }
    }));
}
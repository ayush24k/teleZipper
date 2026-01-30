import { FileInfo } from "./crawler";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import archiver from "archiver";
// @ts-ignore - archiver-zip-encrypted doesn't have types
import archiverZipEncrypted from "archiver-zip-encrypted";
import { uploadToTelegram } from "./telegramUploader";

// Register the encrypted format
archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

export async function zipChunks(
    chunks: FileInfo[][],
    outputDir: string,
    useTelegram: boolean,
    botToken?: string,
    chatId?: string,
    password?: string
) {
    fs.mkdirSync(outputDir, { recursive: true });

    const uploadQueue: Promise<void>[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const zipName = `chunk_${i + 1}.zip`;
        const zipPath = path.join(outputDir, zipName);

        console.log(`📦 Zipping ${zipName}...`);


        const progressBar = new cliProgress.SingleBar(
            {
                format: `Zipping ${zipName} [{bar}] {percentage}% | {value}/{total} files`,
            },
            cliProgress.Presets.shades_classic
        )

        progressBar.start(chunks[i].length, 0);

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
                if (useTelegram) {
                    uploadQueue.push(uploadToTelegram(zipPath, botToken, chatId));
                };
                resolve();
            });

            archive.on("error", reject);

            chunks[i].forEach((file, index) => {
                archive.file(file.path, { name: path.basename(file.path) });
                progressBar.increment();
            });

            archive.finalize();
        });
    }

    if (useTelegram) {
        console.log("\n🚀 Uploading all files to Telegram...");
        await Promise.all(uploadQueue);
    }
}
import { FileInfo } from "./crawler";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import archiver from "archiver";
import { uploadToTelegram } from "./telegramUploader";


export async function zipChunks(
    chunks: FileInfo[][],
    outputDir: string,
    useTelegram: boolean,
    botToken?: string,
    chatId?: string
) {
    fs.mkdirSync(outputDir, { recursive: true });

    const uploadQueue: Promise<void>[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const zipName = `chunk_${i + 1}.zip`;
        const zipPath = path.join(outputDir, zipName);

        console.log(`📦 Zipping ${zipName}`);

        const progressBar = new cliProgress.SingleBar(
            {
                format: `Zipping ${zipName} [{bar}] {percentage}% | {value}/{total} files`,
            },
            cliProgress.Presets.shades_classic
        )

        progressBar.start(chunks[i].length, 0);

        await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

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
        console.log("🚀 Uploading all zips to Telegram...");
        await Promise.all(uploadQueue);
    }
}
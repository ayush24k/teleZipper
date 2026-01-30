import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import cliProgress from "cli-progress";
import { format } from "path";

const bot_token = process.env.TELEGRAM_BOT_TOKEN || "";
const chat_id = process.env.TELEGRAM_CHAT_ID || ""; 

if (!bot_token || !chat_id) {
    throw new Error("telegram credentials are missing");
}

const bot = new TelegramBot(bot_token, { polling: false });

// upload a zip file to telegram with progress bar
export async function uploadToTelegram(zipPath: string) {
    const totalSize = fs.statSync(zipPath).size;

    console.log(`📤 Uploading ${zipPath}`);

    const progressBar = new cliProgress.SingleBar(
        {
            format: "Uploading [{bar}] {percentage}% | {value}/{total} Bytes",
        },
        cliProgress.Presets.shades_classic
    );

    progressBar.start(totalSize, 0);

    const stream = fs.createReadStream(zipPath);
    let uploaded = 0;

    stream.on("data", (chunk) => {
        uploaded += chunk.length;
        progressBar.update(uploaded);
    });

    await bot.sendDocument(chat_id, stream);
    progressBar.stop();
    console.log("✅ Upload complete");
}
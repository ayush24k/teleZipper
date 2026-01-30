import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";

// Suppress the polling deprecation warning
process.env.NTBA_FIX_350 = "1";

// upload a zip file to telegram with progress bar
export async function uploadToTelegram(
    zipPath: string,
    botToken?: string,
    chatId?: string
) {
    const bot_token = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    const chat_id = chatId || process.env.TELEGRAM_CHAT_ID || "";

    if (!bot_token || !chat_id) {
        throw new Error("❌ Telegram credentials are missing. Please provide --bot-token and --chat-id or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.");
    }

    const bot = new TelegramBot(bot_token, { polling: false });
    const totalSize = fs.statSync(zipPath).size;
    const fileName = path.basename(zipPath);
    const fileSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`\n📤 Uploading ${fileName} (${fileSizeMB} MB)`);

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
    console.log(`✅ ${fileName} uploaded successfully`);
}
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import input from "input";

let client: TelegramClient | null = null;
const sessionPath = path.join(process.cwd(), ".telegram_session");

export async function initTelegramClient(apiId?: string, apiHash?: string) {
    const API_ID = Number(apiId || process.env.TELEGRAM_API_ID);
    const API_HASH = apiHash || process.env.TELEGRAM_API_HASH;

    if (!API_ID || !API_HASH) {
        throw new Error("❌ Telegram API_ID and API_HASH are required for MTProto. Please set them in .env or provide as arguments.");
    }

    let sessionString = "";
    if (fs.existsSync(sessionPath)) {
        sessionString = fs.readFileSync(sessionPath, "utf-8");
    }

    const stringSession = new StringSession(sessionString);

    client = new TelegramClient(stringSession, API_ID, API_HASH, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    // Save session
    fs.writeFileSync(sessionPath, client.session.save() as unknown as string);
    console.log("✅ Connected to Telegram via MTProto!");
}

export async function uploadToTelegram(
    zipPath: string,
    chatId?: string
) {
    if (!client) {
        throw new Error("❌ Telegram client not initialized.");
    }

    const chat_id = chatId || process.env.TELEGRAM_CHAT_ID;
    if (!chat_id) {
        throw new Error("❌ Chat ID is missing.");
    }

    const fileName = path.basename(zipPath);
    const totalSize = fs.statSync(zipPath).size;
    const fileSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`\n📤 Uploading ${fileName} (${fileSizeMB} MB)`);

    const progressBar = new cliProgress.SingleBar(
        {
            format: "Uploading [{bar}] {percentage}% | {value}/{total} Bytes",
        },
        cliProgress.Presets.shades_classic
    );

    progressBar.start(totalSize, 0);

    try {
        await client.sendFile(chat_id, {
            file: zipPath,
            forceDocument: true,
            progressCallback: (progress: number) => {
                // progress is 0 to 1 (float)
                // We need to map it to bytes for the progress bar, but GramJS progress is sometimes tricky.
                // Assuming it's ratio.
                progressBar.update(Math.floor(progress * totalSize));
            }
        });

        progressBar.update(totalSize); // Ensure it finishes
        progressBar.stop();
        console.log(`✅ ${fileName} uploaded successfully`);
    } catch (error) {
        progressBar.stop();
        console.error(`❌ Failed to upload ${fileName}:`, error);
        throw error;
    }
}

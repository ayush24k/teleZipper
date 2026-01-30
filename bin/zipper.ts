#!/usr/bin/env node
import "dotenv/config";
import path from "path";
import { Command } from "commander";
import { crawl } from "../src/crawler";
import { chunkFiles } from "../src/chunking";
import { zipChunks } from "../src/zipper";

const program = new Command();

program
  .argument("<source>", "File or folder to zip")
  .option("-o, --output <dir>", "Output directory", "output")
  .option("-p, --password <password>", "Password to protect zip files")
  .option("--telegram", "Upload zip files to Telegram")
  .option("--bot-token <token>", "Telegram bot token (required if using --telegram)")
  .option("--chat-id <id>", "Telegram chat ID (required if using --telegram)")
  .parse();

(async () => {
  const source = path.resolve(program.args[0]);
  const outputDir = path.resolve(program.opts().output);
  const useTelegram = program.opts().telegram || false;
  const botToken = program.opts().botToken;
  const chatId = program.opts().chatId;
  const password = program.opts().password;

  console.log(`\n🕸️  Crawling files in ${source}...`);
  const files = await crawl(source);

  console.log(`📂 Found ${files.length} file${files.length !== 1 ? 's' : ''}`);

  const chunks = chunkFiles(files);
  console.log(`📦 Created ${chunks.length} chunk${chunks.length !== 1 ? 's' : ''} (max 2GB each)${password ? ' 🔒 Password protected' : ''}\n`);

  await zipChunks(chunks, outputDir, useTelegram, botToken, chatId, password);

  console.log(`\n🎉 All done! ${useTelegram ? 'Files uploaded to Telegram.' : `Zips saved to ${outputDir}`}`);
})();
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

  console.log(`🕸️ Crawling files in ${source}...`);
  const files = await crawl(source);

  console.log(`📂 Found ${files.length} files. Chunking...`);
  const chunks = chunkFiles(files);
  console.log(`📦 Created ${chunks.length} chunks. Zipping...`);

  await zipChunks(chunks, outputDir, useTelegram, botToken, chatId);

  console.log("🎉 process done!");
})();
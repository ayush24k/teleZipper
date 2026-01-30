# TeleZipper

Split folders into multiple 2GB zip files with optional Telegram upload.

[![npm version](https://img.shields.io/npm/v/@ayush24k/telezipper.svg)](https://www.npmjs.com/package/@ayush24k/telezipper)
[![npm downloads](https://img.shields.io/npm/dm/@ayush24k/telezipper.svg)](https://www.npmjs.com/package/@ayush24k/telezipper)

## Installation

### Option 1: Install from npm (Recommended)

Install globally from npm:

```bash
npm install -g @ayush24k/telezipper
```

Now you can use `telezipper` from anywhere on your system!

### Option 2: Install from source

Clone the repository and link locally:

```bash
git clone https://github.com/ayush24k/teleZipper.git
cd /path/to/telezipper
npm install
npm run build
npm link
```

Now you can use `telezipper` from anywhere on your system!

## Usage

### Basic Usage (Zip only)

```bash
telezipper <source> -o <output-directory>
```

Example:
```bash
telezipper ./my-folder -o ./output
```

### With Telegram Upload

You can provide Telegram credentials in two ways:

#### Option 1: Command-line arguments (Recommended for flexibility)

```bash
telezipper <source> --telegram --bot-token YOUR_BOT_TOKEN --chat-id YOUR_CHAT_ID
```

Example:
```bash
telezipper ./my-folder --telegram --bot-token 123456:ABC-DEF1234ghIkl --chat-id 987654321
```

#### Option 2: Environment variables

Create a `.env` file in the project directory or set environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

Then run:
```bash
telezipper ./my-folder --telegram
```

## Options

- `<source>` - File or folder to zip (required)
- `-o, --output <dir>` - Output directory (default: "output")
- `--telegram` - Upload zip files to Telegram
- `--bot-token <token>` - Telegram bot token (required if using --telegram without env vars)
- `--chat-id <id>` - Telegram chat ID (required if using --telegram without env vars)
- `-h, --help` - Display help

## Examples

### Zip a folder to the default output directory
```bash
telezipper ./my-project
```

### Zip and specify custom output directory
```bash
telezipper ./my-project -o ./backups
```

### Zip and upload to Telegram with inline credentials
```bash
telezipper ./my-project --telegram --bot-token 123456:ABC-DEF --chat-id 987654321
```

### Zip and upload using environment variables
```bash
# Set environment variables first
export TELEGRAM_BOT_TOKEN=123456:ABC-DEF
export TELEGRAM_CHAT_ID=987654321

# Then run
telezipper ./my-project --telegram
```

## How to Get Telegram Credentials

1. **Bot Token**: Create a bot using [@BotFather](https://t.me/botfather) on Telegram
2. **Chat ID**: 
   - Send a message to your bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

## Features

- ✅ Automatically splits large folders into 2GB chunks
- ✅ Creates zip files with maximum compression
- ✅ Optional Telegram upload with progress bars
- ✅ Works from any directory on your system
- ✅ Flexible credential management (CLI args or env vars)

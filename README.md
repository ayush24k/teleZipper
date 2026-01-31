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

### Chunking + Upload to Telegram (MTProto)
This tool now uses **MTProto** (the Telegram Client Protocol) to support **large file uploads (up to 2GB)** and faster speeds. 

To use it, you need a `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`. You can get these from [my.telegram.org](https://my.telegram.org).

You can pass them as arguments or set them in a `.env` file.

### Usage Examples

#### 1. Basic Zip (No Password, No Telegram)
```bash
telezipper ./my-folder
# Output: ./output/chunk_1.zip
```

#### 2. Zip with Password
```bash
telezipper ./my-folder -p "secret123"
# Output: Encrypted zip files in ./output
```

#### 3. Zip + Upload to Telegram (Env Vars Set)
Assuming `.env` has credentials:
```bash
telezipper ./my-folder --telegram
```

#### 4. Zip + Upload to Telegram (CLI Args)
```bash
telezipper ./my-folder --telegram --api-id 12345 --api-hash abcdef123 --chat-id -100123456789
```

#### 5. Password Protected Upload
```bash
telezipper ./my-folder --telegram -p "mypassword"
```

### Logging In
- **User Login**: The tool will ask for your phone number and login code interactively. This session is saved locally in `.telegram_session`.

## Options

- `<source>` - File or folder to zip (required)
- `-o, --output <dir>` - Output directory (default: "output")
- `-p, --password <password>` - Password to protect zip files (optional)
- `--telegram` - Upload zip files to Telegram
- `--api-id <id>` - Telegram API ID (required for MTProto)
- `--api-hash <hash>` - Telegram API Hash (required for MTProto)
- `--chat-id <id>` - Chat ID to upload to (User ID or Channel/Group ID)
- `-h, --help` - Display help

## Features

- 🚀 **MTProto Support**: Uploads files >50MB (tested up to 2GB).
- 🔐 **Encrypted Zips**: Optional AES-256 password protection.

- ⏯️ **Serial Uploads**: Uploads files one by one with a random delay (2-5s) to avoid flood limits.
- 💾 **Smart Chunking**: Splits large folders into zip chunks (max 2GB each).
- ✅ **MTProto Auth**: Support for User accounts with session persistence.

## How to Get Telegram Credentials
1. **API ID & Hash**: Go to [my.telegram.org](https://my.telegram.org), log in, and click "API development tools". Create a new application to get your `App api_id` and `App api_hash`.
2. **Chat ID**: You can get your Chat ID by forwarding a message to a bot like @userinfobot. For channels/groups, it usually starts with `-100`.

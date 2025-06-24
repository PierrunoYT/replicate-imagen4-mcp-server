# Replicate Imagen 4 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![Replicate](https://img.shields.io/badge/Replicate-Imagen%204%20Ultra-green)](https://replicate.com/)

A Model Context Protocol (MCP) server that provides access to Google's Imagen 4 Ultra model through the Replicate platform. This server enables high-quality image generation with enhanced detail, richer lighting, and fewer artifacts.

**🔗 Repository**: [https://github.com/PierrunoYT/replicate-imagen4-mcp-server](https://github.com/PierrunoYT/replicate-imagen4-mcp-server)

> **🚀 Ready to use!** Works everywhere with npx - no local installation required.

## Features

- **High-Quality Image Generation**: Uses Google's Imagen 4 Ultra model via Replicate
- **Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 3:4, and 4:3
- **Multiple Output Formats**: JPG and PNG support
- **Safety Filtering**: Configurable content safety levels
- **File Saving**: Generate and save images directly to disk
- **Prediction Tracking**: Check status of running predictions
- **Portable Installation**: Works anywhere with npx + GitHub
- **Robust Error Handling**: Graceful handling of missing tokens and API errors
- **Connection Stability**: No more unexpected disconnections or crashes
- **Detailed Responses**: Returns image URLs, metadata, and generation details

## Prerequisites

- Node.js 18 or higher
- Replicate API token

## Installation

### Option 1: Portable Installation (Recommended)

The easiest way to use this MCP server is with npx, which works anywhere without local installation:

```json
{
  "mcpServers": {
    "replicate-imagen4": {
      "command": "npx",
      "args": ["-y", "https://github.com/PierrunoYT/replicate-imagen4-mcp-server.git"],
      "env": {
        "REPLICATE_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Option 2: Local Installation

For local development or if you prefer to clone the repository:

```bash
git clone https://github.com/PierrunoYT/replicate-imagen4-mcp-server.git
cd replicate-imagen4-mcp-server
npm install
npm run build
```

## Setup

### 1. Get your Replicate API Token

- Visit [Replicate](https://replicate.com/)
- Sign up for an account
- Navigate to your account settings
- Generate an API token

### 2. Set Environment Variable

Set the REPLICATE_API_TOKEN environment variable:

```bash
export REPLICATE_API_TOKEN=r8_NBY**********************************
```

Or create a `.env` file:

```
REPLICATE_API_TOKEN=r8_NBY**********************************
```

## Recent Improvements

### v2.0.0 - Enhanced Stability & Portability

- **🔧 Fixed Connection Drops**: Resolved server crashes when API token is missing or invalid
- **📦 Portable Installation**: Added npx support for installation-free usage from GitHub
- **🛡️ Graceful Error Handling**: Server now handles errors gracefully without unexpected shutdowns
- **⚡ Improved Reliability**: Enhanced connection stability and error recovery
- **🌐 Universal Compatibility**: Works on any system with Node.js, no local setup required
```

### 3. Clone or Download

```bash
git clone https://github.com/PierrunoYT/replicate-imagen4-mcp-server.git
cd replicate-imagen4-mcp-server
```

### 4. Install Dependencies (Optional)

The server is pre-built, but if you want to modify it:

```bash
npm install
npm run build
```

## Configuration

### Quick Setup Helper

Run the path helper to get the exact configuration for your system:

```bash
npm run get-path
```

This will output the complete MCP configuration with the correct absolute path.

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "replicate-imagen4": {
      "command": "node",
      "args": ["path/to/replicate-imagen4-mcp-server/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token-here"
      }
    }
  }
}
```

### For Kilo Code MCP Settings

Add to your MCP settings file at:
`C:\Users\[username]\AppData\Roaming\Kilo-Code\MCP\settings\mcp_settings.json`

```json
{
  "mcpServers": {
    "replicate-imagen4": {
      "command": "node",
      "args": ["path/to/replicate-imagen4-mcp-server/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Available Tools

### `imagen4_generate`

Generate images using Imagen 4 Ultra.

**Parameters:**
- `prompt` (required): Text prompt for image generation
- `aspect_ratio` (optional): "1:1", "9:16", "16:9", "3:4", or "4:3" (default: "1:1")
- `output_format` (optional): "jpg" or "png" (default: "jpg")
- `safety_filter_level` (optional): "block_low_and_above", "block_medium_and_above", or "block_only_high" (default: "block_only_high")

**Response includes:**
- Image URL for immediate access
- Generation metadata and settings

### `imagen4_generate_and_save`

Generate images using Imagen 4 Ultra and save them to a local file.

**Parameters:**
- `prompt` (required): Text prompt for image generation
- `filename` (optional): Filename to save the image (default: "output.jpg")
- `aspect_ratio` (optional): "1:1", "9:16", "16:9", "3:4", or "4:3" (default: "1:1")
- `output_format` (optional): "jpg" or "png" (default: "jpg")
- `safety_filter_level` (optional): "block_low_and_above", "block_medium_and_above", or "block_only_high" (default: "block_only_high")

**Features:**
- Downloads the generated image automatically
- Saves to specified filename
- Returns both URL and local file path

### `imagen4_get_prediction`

Get the status and result of a specific Replicate prediction.

**Parameters:**
- `prediction_id` (required): The ID of the prediction to check

**Use this tool to:**
- Check the status of long-running predictions
- Get detailed logs and error information
- Retrieve results from async operations

## Example Usage

### Basic Image Generation
```
Generate a photorealistic image of a golden retriever playing in a field of sunflowers
```

### With Specific Parameters
```
Generate an image with:
- Prompt: "A minimalist logo design for a tech startup, clean lines"
- Aspect ratio: 16:9
- Output format: png
- Safety filter: block_medium_and_above
```

### Generate and Save to File
```
Generate and save an image of "A futuristic cityscape at night with neon lights and flying cars" 
to "cityscape.jpg" with 16:9 aspect ratio
```

### Using the Example Code

Here's how to use the Replicate API directly in your own code:

```javascript
import { writeFile } from "fs/promises";
import Replicate from "replicate";

const replicate = new Replicate();

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the nostalgic warmth of a mid-2000s indie film. The focus is a young woman with a sleek, straight bob haircut in cool platinum white with freckled skin, looking directly and intently into the camera lens with a knowing smirk, her head is looking up slightly. She wears an oversized band t-shirt that says \"Imagen 4 Ultra on Replicate\" in huge stylized text over a long-sleeved striped top and simple silver stud earrings. The lighting is soft, golden hour sunlight creating lens flare and illuminating dust motes in the air. The background shows a blurred outdoor urban setting with graffiti-covered walls (the graffiti says \"ultra\" in stylized graffiti lettering), rendered with a shallow depth of field. Natural film grain, a warm, slightly muted color palette, and sharp focus on her expressive eyes enhance the intimate, authentic feel",
    aspect_ratio: "16:9"
};

const output = await replicate.run("google/imagen-4-ultra", { input });
await writeFile("output.jpg", output);
//=> output.jpg written to disk
```

## Technical Details

### Architecture
- **Language**: TypeScript with ES2022 target
- **Runtime**: Node.js 18+ with ES modules
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.0
- **API Client**: Replicate JavaScript client v0.34.1
- **Validation**: Zod schema validation

### API Model Used
- **Model**: `google/imagen-4-ultra` on Replicate
- **Capabilities**: High-quality image generation with advanced safety filtering

### Error Handling
- Environment variable validation
- API error catching and reporting
- Network error handling for file downloads
- Detailed error messages with context

## Development

### Project Structure
```
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript (ready to use)
├── test-server.js        # Server testing utility
├── get-path.js          # Configuration path helper
├── example-mcp-config.json # Example configuration
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run start` - Start the server directly
- `npm run test` - Test server startup and basic functionality
- `npm run get-path` - Get configuration path for your system

### Making Changes
1. Edit files in the `src/` directory
2. Run `npm run build` to compile
3. Restart your MCP client to use the updated server

### Testing
```bash
npm run test
```

This runs a basic connectivity test that verifies:
- Server starts correctly
- MCP protocol initialization
- Tool discovery functionality

## API Costs

This server uses the Replicate platform, which charges per image generation. Check [Replicate pricing](https://replicate.com/pricing) for current rates.

**Typical costs** (as of 2024):
- Imagen 4 Ultra: ~$0.05-0.10 per image
- Costs vary by resolution and complexity

## Authentication

The Replicate API uses token-based authentication. Your token should be kept secure and not included in your code. Always use environment variables:

```bash
export REPLICATE_API_TOKEN=r8_NBY**********************************
```

You can test your authentication with:

```bash
curl https://api.replicate.com/v1/account -H "Authorization: Bearer $REPLICATE_API_TOKEN"
```

## Troubleshooting

### Server not appearing in MCP client
1. Verify the path to `build/index.js` is correct and absolute
2. Check that your REPLICATE_API_TOKEN is set correctly in the environment variables
3. Ensure Node.js 18+ is installed: `node --version`
4. Test server startup: `npm run test`
5. Restart your MCP client (Claude Desktop, Kilo Code, etc.)

### Image generation failing
1. Verify your Replicate API token is valid and has sufficient credits
2. Check that your prompt follows Replicate's content policy
3. Try adjusting the safety filter level
4. Check the server logs for detailed error messages
5. Use the `imagen4_get_prediction` tool to check prediction status

### Build issues
If you need to rebuild the server:
```bash
npm install
npm run build
```

### Configuration issues
Use the helper script to get the correct path:
```bash
npm run get-path
```

## Support

For issues with:
- **This MCP server**: Create an issue in this repository
- **Replicate API**: Check [Replicate documentation](https://replicate.com/docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run test`
5. Submit a pull request

## Changelog

### v1.0.0
- Initial release with Replicate integration
- Support for Imagen 4 Ultra via Replicate
- Image generation and file saving capabilities
- Prediction status tracking
- Comprehensive error handling and logging
- Pre-built executable for immediate use
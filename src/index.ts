#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Replicate from "replicate";
import { writeFile } from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";

// Check for required environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  console.error('Please set your Replicate API token: export REPLICATE_API_TOKEN=your_token_here');
}

// Configure Replicate client (will be null if no token)
let replicate: Replicate | null = null;
if (REPLICATE_API_TOKEN) {
  try {
    replicate = new Replicate({
      auth: REPLICATE_API_TOKEN
    });
  } catch (error) {
    console.error('Failed to initialize Replicate client:', error);
  }
}

// Define types based on Replicate API
interface ReplicateImageResult {
  url?: string;
  urls?: string[];
}

// Download image function
async function downloadImage(url: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Parse the URL and determine HTTP/HTTPS client
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    // Create 'images' directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Create file write stream
    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);
    
    // Download and pipe to file
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Generate safe filename for images
function generateImageFilename(prompt: string, index: number, format: string): string {
  // Creates safe filename: imagen4_prompt_index_timestamp.ext
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .substring(0, 50);            // Limit length
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `imagen4_${safePrompt}_${index}_${timestamp}.${format}`;
}

// Create MCP server
const server = new McpServer({
  name: "replicate-imagen4-server",
  version: "1.0.0",
});

// Tool: Generate images with Imagen 4 Ultra
server.tool(
  "imagen4_generate",
  {
    description: "Generate high-quality images using Google's Imagen 4 Ultra model via Replicate",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Text prompt for image generation"
        },
        aspect_ratio: {
          type: "string",
          enum: ["1:1", "9:16", "16:9", "3:4", "4:3"],
          description: "Aspect ratio of the generated image",
          default: "1:1"
        },
        output_format: {
          type: "string",
          enum: ["jpg", "png"],
          description: "Format of the output image",
          default: "jpg"
        },
        safety_filter_level: {
          type: "string",
          enum: ["block_low_and_above", "block_medium_and_above", "block_only_high"],
          description: "Safety filter level - block_low_and_above is strictest, block_medium_and_above blocks some prompts, block_only_high is most permissive",
          default: "block_only_high"
        }
      },
      required: ["prompt"]
    }
  },
  async (args: any) => {
    const {
      prompt,
      aspect_ratio = "1:1",
      output_format = "jpg",
      safety_filter_level = "block_only_high"
    } = args;
    
    try {
      // Check if Replicate client is available
      if (!replicate) {
        return {
          content: [
            {
              type: "text",
              text: "Error: REPLICATE_API_TOKEN environment variable is not set. Please configure your Replicate API token."
            }
          ],
          isError: true
        };
      }

      console.error(`Generating image with prompt: "${prompt}"`);

      // Call Replicate Imagen 4 Ultra API
      const output = await replicate.run("google/imagen-4-ultra", {
        input: {
          prompt,
          aspect_ratio,
          output_format,
          safety_filter_level
        }
      }) as ReplicateImageResult;

      // Handle the output - it could be a single URL or an array of URLs
      let imageUrls: string[] = [];
      if (typeof output === 'string') {
        imageUrls = [output];
      } else if (output.url) {
        imageUrls = [output.url];
      } else if (output.urls && output.urls.length > 0) {
        imageUrls = output.urls;
      } else {
        throw new Error('No image URL returned from Replicate');
      }

      console.error("Downloading images locally...");
      const downloadedImages = [];

      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const filename = generateImageFilename(prompt, i + 1, output_format);
        
        try {
          const localPath = await downloadImage(imageUrl, filename);
          downloadedImages.push({
            url: imageUrl,
            localPath,
            index: i + 1
          });
          console.error(`Downloaded: ${filename}`);
        } catch (downloadError) {
          console.error(`Failed to download image ${i + 1}:`, downloadError);
          // Graceful fallback - still provide original URL
          downloadedImages.push({
            url: imageUrl,
            localPath: null,
            index: i + 1,
            error: downloadError instanceof Error ? downloadError.message : 'Unknown download error'
          });
        }
      }

      let responseText = `Successfully generated ${downloadedImages.length} image(s) using Imagen 4 Ultra:

Prompt: "${prompt}"
Aspect Ratio: ${aspect_ratio}
Output Format: ${output_format}
Safety Filter Level: ${safety_filter_level}

Generated Images:`;

      downloadedImages.forEach((img) => {
        responseText += `\nImage ${img.index}:`;
        if (img.localPath) {
          responseText += `\n  Local Path: ${img.localPath}`;
        }
        responseText += `\n  Original URL: ${img.url}`;
        if (img.error) {
          responseText += `\n  Download Error: ${img.error}`;
        }
      });

      responseText += `\n\nImages have been downloaded to the local 'images' directory.`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error generating image:', error);
      
      let errorMessage = "Failed to generate image with Imagen 4 Ultra.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Tool: Generate and save image to file
server.tool(
  "imagen4_generate_and_save",
  {
    description: "Generate an image using Imagen 4 Ultra and save it to a local file",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Text prompt for image generation"
        },
        filename: {
          type: "string",
          description: "Filename to save the image (e.g., 'output.jpg')",
          default: "output.jpg"
        },
        aspect_ratio: {
          type: "string",
          enum: ["1:1", "9:16", "16:9", "3:4", "4:3"],
          description: "Aspect ratio of the generated image",
          default: "1:1"
        },
        output_format: {
          type: "string",
          enum: ["jpg", "png"],
          description: "Format of the output image",
          default: "jpg"
        },
        safety_filter_level: {
          type: "string",
          enum: ["block_low_and_above", "block_medium_and_above", "block_only_high"],
          description: "Safety filter level - block_low_and_above is strictest, block_medium_and_above blocks some prompts, block_only_high is most permissive",
          default: "block_only_high"
        }
      },
      required: ["prompt"]
    }
  },
  async (args: any) => {
    const {
      prompt,
      filename = "output.jpg",
      aspect_ratio = "1:1",
      output_format = "jpg",
      safety_filter_level = "block_only_high"
    } = args;
    
    try {
      // Check if Replicate client is available
      if (!replicate) {
        return {
          content: [
            {
              type: "text",
              text: "Error: REPLICATE_API_TOKEN environment variable is not set. Please configure your Replicate API token."
            }
          ],
          isError: true
        };
      }

      console.error(`Generating and saving image with prompt: "${prompt}"`);

      // Call Replicate Imagen 4 Ultra API
      const output = await replicate.run("google/imagen-4-ultra", {
        input: {
          prompt,
          aspect_ratio,
          output_format,
          safety_filter_level
        }
      }) as ReplicateImageResult;

      // Handle the output - it could be a single URL or an array of URLs
      let imageUrls: string[] = [];
      if (typeof output === 'string') {
        imageUrls = [output];
      } else if (output.url) {
        imageUrls = [output.url];
      } else if (output.urls && output.urls.length > 0) {
        imageUrls = output.urls;
      } else {
        throw new Error('No image URL returned from Replicate');
      }

      console.error("Downloading images locally...");
      const downloadedImages = [];

      // If user provided a specific filename, use it for the first image
      // Otherwise, generate automatic filenames
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        let targetFilename: string;
        
        if (i === 0 && filename !== "output.jpg") {
          // Use user-provided filename for first image
          targetFilename = filename;
        } else {
          // Generate automatic filename
          targetFilename = generateImageFilename(prompt, i + 1, output_format);
        }
        
        try {
          const localPath = await downloadImage(imageUrl, targetFilename);
          downloadedImages.push({
            url: imageUrl,
            localPath,
            filename: targetFilename,
            index: i + 1
          });
          console.error(`Downloaded: ${targetFilename}`);
        } catch (downloadError) {
          console.error(`Failed to download image ${i + 1}:`, downloadError);
          // Graceful fallback - still provide original URL
          downloadedImages.push({
            url: imageUrl,
            localPath: null,
            filename: targetFilename,
            index: i + 1,
            error: downloadError instanceof Error ? downloadError.message : 'Unknown download error'
          });
        }
      }

      let responseText = `Successfully generated and saved ${downloadedImages.length} image(s) using Imagen 4 Ultra:

Prompt: "${prompt}"
Aspect Ratio: ${aspect_ratio}
Output Format: ${output_format}
Safety Filter Level: ${safety_filter_level}

Generated Images:`;

      downloadedImages.forEach((img) => {
        responseText += `\nImage ${img.index}:`;
        if (img.localPath) {
          responseText += `\n  Local Path: ${img.localPath}`;
          responseText += `\n  Filename: ${img.filename}`;
        }
        responseText += `\n  Original URL: ${img.url}`;
        if (img.error) {
          responseText += `\n  Download Error: ${img.error}`;
        }
      });

      responseText += `\n\nImages have been downloaded to the local 'images' directory.`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error generating and saving image:', error);
      
      let errorMessage = "Failed to generate and save image with Imagen 4 Ultra.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Tool: Get prediction status
server.tool(
  "imagen4_get_prediction",
  {
    description: "Get the status and result of a specific Replicate prediction",
    inputSchema: {
      type: "object",
      properties: {
        prediction_id: {
          type: "string",
          description: "The ID of the prediction to check"
        }
      },
      required: ["prediction_id"]
    }
  },
  async (args: any) => {
    const { prediction_id } = args;
    
    try {
      // Check if Replicate client is available
      if (!replicate) {
        return {
          content: [
            {
              type: "text",
              text: "Error: REPLICATE_API_TOKEN environment variable is not set. Please configure your Replicate API token."
            }
          ],
          isError: true
        };
      }

      console.error(`Getting prediction status for: ${prediction_id}`);

      const prediction = await replicate.predictions.get(prediction_id);

      const responseText = `Prediction Status:

ID: ${prediction.id}
Status: ${prediction.status}
Model: ${prediction.model}
Created: ${prediction.created_at}
${prediction.completed_at ? `Completed: ${prediction.completed_at}` : ''}

${prediction.input ? `Input: ${JSON.stringify(prediction.input, null, 2)}` : ''}

${prediction.output ? `Output: ${JSON.stringify(prediction.output, null, 2)}` : ''}

${prediction.error ? `Error: ${prediction.error}` : ''}

${prediction.logs ? `Logs: ${prediction.logs}` : ''}`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error getting prediction:', error);
      
      let errorMessage = "Failed to get prediction status.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Replicate Imagen 4 MCP server running on stdio');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
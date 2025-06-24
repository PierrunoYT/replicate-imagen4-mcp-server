#!/usr/bin/env node

// Example usage of Replicate's Imagen 4 Ultra API
// This demonstrates the direct API usage as shown in the Replicate documentation

import { writeFile } from "fs/promises";
import Replicate from "replicate";

// Check for required environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  console.error('Set it with: export REPLICATE_API_TOKEN=r8_NBY**********************************');
  process.exit(1);
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN
});

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the nostalgic warmth of a mid-2000s indie film. The focus is a young woman with a sleek, straight bob haircut in cool platinum white with freckled skin, looking directly and intently into the camera lens with a knowing smirk, her head is looking up slightly. She wears an oversized band t-shirt that says \"Imagen 4 Ultra on Replicate\" in huge stylized text over a long-sleeved striped top and simple silver stud earrings. The lighting is soft, golden hour sunlight creating lens flare and illuminating dust motes in the air. The background shows a blurred outdoor urban setting with graffiti-covered walls (the graffiti says \"ultra\" in stylized graffiti lettering), rendered with a shallow depth of field. Natural film grain, a warm, slightly muted color palette, and sharp focus on her expressive eyes enhance the intimate, authentic feel",
    aspect_ratio: "16:9"
};

console.log('Generating image with Replicate Imagen 4 Ultra...');
console.log('Prompt:', input.prompt.substring(0, 100) + '...');
console.log('Aspect ratio:', input.aspect_ratio);

try {
    const output = await replicate.run("google/imagen-4-ultra", { input });
    
    // Handle different output formats
    let imageUrl;
    if (typeof output === 'string') {
        imageUrl = output;
    } else if (output && output.url) {
        imageUrl = output.url;
    } else if (output && output.urls && output.urls.length > 0) {
        imageUrl = output.urls[0];
    } else {
        throw new Error('Unexpected output format from Replicate');
    }
    
    console.log('Image generated successfully!');
    console.log('Image URL:', imageUrl);
    
    // Download and save the image
    console.log('Downloading image...');
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await writeFile("output.jpg", buffer);
    console.log('=> output.jpg written to disk');
    
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
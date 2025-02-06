import { SuiAgentKit } from "../../index";
import OpenAI from "openai";
import logger from "../../utils/logger";

/**
 * Generate an image using OpenAI's DALL-E
 * @param agent SuiAgentKit instance
 * @param prompt Text description of the image to generate
 * @param size Image size ('256x256', '512x512', or '1024x1024') (default: '1024x1024')
 * @param n Number of images to generate (default: 1)
 * @returns Object containing the generated image URLs
 */
export async function create_image(
  agent: SuiAgentKit,
  prompt: string,
  size: "256x256" | "512x512" | "1024x1024" = "1024x1024",
  n: number = 1,
) {
  try {
    if (!agent.config.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found in agent configuration");
    }

    const openai = agent.config.BASE_URL
      ? new OpenAI({
          apiKey: agent.config.OPENAI_API_KEY,
          baseURL: agent.config.BASE_URL,
        })
      : new OpenAI({
          apiKey: agent.config.OPENAI_API_KEY,
        });

    const response = await openai.images.generate({
      prompt,
      n,
      size,
    });

    return {
      images: response.data.map((img: any) => img.url),
    };
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

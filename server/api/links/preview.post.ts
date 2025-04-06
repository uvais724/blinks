import ogs from 'open-graph-scraper';
import { defineEventHandler, readBody } from 'h3';

interface PreviewResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    thumbnail: string;
    domain: string;
  };
  error?: string;
}

export default defineEventHandler(async (event): Promise<PreviewResponse> => {
  const { url } = await readBody(event);

  try {
    const { result } = await ogs({ url });
    return {
      success: true,
      data: {
        title: result.ogTitle || 'No title',
        description: result.ogDescription || '',
        thumbnail: result.ogImage?.[0]?.url || '',
        domain: new URL(url).hostname,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch link preview' };
  }
});
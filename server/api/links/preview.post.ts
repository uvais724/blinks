import ogs from 'open-graph-scraper';
import { defineEventHandler, readBody } from 'h3';
import { fetchPreview } from '~/server/utils/linkScraper';

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
    const result = await fetchPreview(url);
    console.log('Preview result:', result);
    return {
      success: true,
      data: {
        title: result.title || 'No title',
        description: result.description || '',
        thumbnail: result.image || '',
        domain: new URL(url).hostname,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch link preview' };
  }
});
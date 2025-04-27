import puppeteer from 'puppeteer';
import ogs from 'open-graph-scraper';
import { cp } from 'fs';

/**
 * Fetches preview data for a given URL using open-graph-scraper.
 * Falls back to Puppeteer if open-graph-scraper fails.
 * @param {string} url - The URL to fetch preview data for.
 * @returns {Promise<object>} - The preview data.
 */
export async function fetchPreview(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    console.log('YouTube URL detected:', url);
    const videoId = getYouTubeVideoId(url);
    console.log('YouTube video ID:', videoId);
    if(videoId === null) {
      throw new Error('Invalid YouTube URL');     
    }
    return fetchYouTubeMetadata(videoId);
  }

  if(url.includes('reddit.com') || url.includes('redd.it')) {
    console.log('Reddit URL detected:', url);
    try {
      const { result, error } = await ogs({ url });
      if (!error && result.success) {
        console.log('open-graph-scraper result:', result);
        return {
          title: result.ogTitle,
          description: result.ogDescription,
          image: Array.isArray(result.ogImage) && result.ogImage.length > 0 ? result.ogImage[0].url : null,
          url: result.requestUrl || url,
          tool: 'open-graph-scraper',
        };
      }
    } catch (error) {
      console.error('Error fetching Reddit preview:', error);
      throw new Error('Failed to fetch Reddit preview data');
    }
  }

  // Fallback to Puppeteer
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
      headless: true
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const type = req.resourceType();
      if (['stylesheet', 'font', 'media'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

  page.setDefaultNavigationTimeout(60000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const previewData = await page.evaluate(() => {
      const title = document.querySelector('title')?.innerText || 'No title available';
      const description =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        'No description available';
      const image =
        document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        null;

      return { title, description, image, tool: 'Puppeteer' };
    });

    await browser.close();
    return { ...previewData, url };
  } catch (puppeteerError) {
    if (puppeteerError instanceof Error) {
      console.error(`Puppeteer failed: ${puppeteerError.message}`);
    } else {
      console.error('Puppeteer failed with an unknown error.');
    }
    throw new Error('Both open-graph-scraper and Puppeteer failed to fetch preview data.');
  }
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchYouTubeMetadata(videoId: string) {
  let totalApiCallsToday = 0;
  const DAILY_QUOTA_LIMIT = 9000;

  if (totalApiCallsToday >= DAILY_QUOTA_LIMIT) {
    throw new Error('Daily YouTube API quota limit reached');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  console.log('YouTube API key:', apiKey);
  console.log('YouTube video ID:', videoId);
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
  totalApiCallsToday++;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
      throw new Error('YouTube API quota exceeded');
    }
    throw new Error('YouTube API error');
  }

  const data = await res.json();
  console.log('YouTube API response:', data);
  return {
    title: data.items[0]?.snippet.title,
    description: data.items[0]?.snippet.description,
    image: data.items[0]?.snippet.thumbnails?.high?.url,
  };
}

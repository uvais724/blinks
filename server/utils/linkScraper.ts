import puppeteer from 'puppeteer';
import axios from 'axios';
import { JSDOM } from 'jsdom'

/**
 * Fetches preview data for a given URL using open-graph-scraper.
 * Falls back to Puppeteer if open-graph-scraper fails.
 * @param {string} url - The URL to fetch preview data for.
 * @returns {Promise<object>} - The preview data.
 */
export async function fetchPreview(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return await returnYoutubeMetadataForUrl(url);
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

function normalizeYouTubeUrl(url: string | URL) {
  const parsed = new URL(url);

  // If it's a shortened youtu.be link
  if (parsed.hostname === 'youtu.be') {
    const videoId = parsed.pathname.slice(1); // remove leading "/"
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Otherwise, return the url as-is
  return url;
}

async function returnYoutubeMetadataForUrl(url: string) {
  let normalizedUrl = url;
  if(url.includes('youtu.be')) {
    normalizedUrl = normalizeYouTubeUrl(url).toString();
    console.log('Normalized YouTube URL:', normalizedUrl);
  }
  
  const { data: html } = await axios.get(normalizedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive'
    }
    
  });

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const getMetaContent = (property: string) => 
    (document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement)?.content || '';

  const metadata = {
    title: getMetaContent('og:title'),
    description: getMetaContent('og:description'),
    thumbnail: getMetaContent('og:image')
  };
  return {
    title: metadata.title,
    description: metadata.description,
    image: metadata.thumbnail,
    tool: 'YouTube oEmbed',
    url: url,
  };
}
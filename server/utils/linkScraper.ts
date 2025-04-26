import ogs from 'open-graph-scraper';
import puppeteer from 'puppeteer';

/**
 * Fetches preview data for a given URL using open-graph-scraper.
 * Falls back to Puppeteer if open-graph-scraper fails.
 * @param {string} url - The URL to fetch preview data for.
 * @returns {Promise<object>} - The preview data.
 */
export async function fetchPreview(url: string) {
  try {
    // Attempt to fetch preview using open-graph-scraper
    const { result, error } = await ogs({ url });
    console.log('open-graph-scraper result:', result);
    if (!error && result.success && result.ogTitle && result.ogDescription && result.ogImage) {
      return {
        title: result.ogTitle || 'No title available',
        description: result.ogDescription || 'No description available',
        image: Array.isArray(result.ogImage) && result.ogImage.length > 0 ? result.ogImage[0].url : null,
        url: result.requestUrl || url,
        tool: 'open-graph-scraper',
      };
    }
    throw new Error('open-graph-scraper failed');
  } catch (err) {
    if (err instanceof Error) {
      console.warn(`open-graph-scraper failed: ${err.message}. Falling back to Puppeteer.`);
    } else {
      console.warn('open-graph-scraper failed with an unknown error. Falling back to Puppeteer.');
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
        headless: true });
      const page = await browser.newPage();
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
}
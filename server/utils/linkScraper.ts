import puppeteer from 'puppeteer';

/**
 * Fetches preview data for a given URL using open-graph-scraper.
 * Falls back to Puppeteer if open-graph-scraper fails.
 * @param {string} url - The URL to fetch preview data for.
 * @returns {Promise<object>} - The preview data.
 */
export async function fetchPreview(url: string) {
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
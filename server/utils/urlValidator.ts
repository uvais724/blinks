export const allowedDomains = [
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'reddit.com',
  'youtube.com',
  'instagram.com',
  'tiktok.com',
];

// Function to validate if the URL belongs to the allowed domains
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
};
export const allowedDomains = [
  'facebook.com',
  'linkedin.com',
  'reddit.com',
  'youtube.com',
  'instagram.com',
  'tiktok.com',
];

export const alternativeDomains: { [key: string]: string } = {
  'youtu.be': 'youtube.com',
  'fb.com': 'facebook.com',
  'fb.me': 'facebook.com',
  'instagr.am': 'instagram.com',
  'lnkd.in': 'linkedin.com',
  'redd.it': 'reddit.com',
  'vm.tiktok.com': 'tiktok.com',
};

// Function to validate if the URL belongs to the allowed domains and starts with https://
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    // Check if the URL starts with https://
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Normalize the domain if it's an alternative domain
    const normalizedDomain =
      alternativeDomains[parsedUrl.hostname] || parsedUrl.hostname;

    // Check if the normalized domain belongs to the allowed domains
    return allowedDomains.some((domain) => normalizedDomain.includes(domain));
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
};
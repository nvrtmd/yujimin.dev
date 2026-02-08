export interface ParsedUrl {
  hostname: string;
  pathname: string;
}

// Falls back to the original trimmed string as hostname if URL parsing fails
export function parseResumeUrl(url: string): ParsedUrl {
  const cleanUrl = url.trim();
  let hostname = cleanUrl;
  let pathname = '';

  try {
    const urlObj = new URL(cleanUrl);
    hostname = urlObj.hostname.replace('www.', '');
    pathname = urlObj.pathname.length > 1 ? urlObj.pathname : '';
  } catch {
    // fallback to original
  }

  return { hostname, pathname };
}

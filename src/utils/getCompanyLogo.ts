export function getCompanyLogo(website?: string | null): string | null {
  if (!website) return null;

  try {
    const urlString = website.startsWith("http") ? website : `https://${website}`;
    const url = new URL(urlString);
    let hostname = url.hostname;

    // Remove 'www.' if present
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return `https://img.logo.dev/${hostname}`;
  } catch (error) {
    // Fallback if URL parsing fails but it looks like a domain
    const cleanStr = website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    
    if (cleanStr && cleanStr.includes(".")) {
      return `https://img.logo.dev/${cleanStr}`;
    }
    
    return null;
  }
}

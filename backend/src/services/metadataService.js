import axios from 'axios';

export const fetchUrlMetadata = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 3000,
    });

    const html = response.data;
    
    // Extract title
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Extract description
    let description = '';
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || 
                      html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i) ||
                      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    // Unescape basic html entities
    const unescapeHtml = (str) => {
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    };

    return {
      title: title ? unescapeHtml(title) : new URL(url).hostname,
      description: description ? unescapeHtml(description) : 'No description available.',
    };
  } catch (error) {
    console.error(`Metadata fetch failed for ${url}:`, error.message);
    try {
      return {
        title: new URL(url).hostname,
        description: 'Unable to load preview description.',
      };
    } catch (e) {
      return {
        title: 'Destination Link',
        description: 'No description available.',
      };
    }
  }
};

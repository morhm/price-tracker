import * as cheerio from 'cheerio';

interface ScrapedData {
  title: string;
  price: number | null;
  isAvailable: boolean;
}

interface Offer {
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
}

interface ProductLdJson {
  '@type': string;
  name?: string;
  offers?: Offer | Array<Offer>;
}

export const extractFromLdJson = ($: cheerio.Root): Partial<ScrapedData> | null => {
  try {
    const ldJsonScripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < ldJsonScripts.length; i++) {
      const script = ldJsonScripts.eq(i);
      const jsonText = script.text();
      if (!jsonText) continue;
      
      try {
        const data = JSON.parse(jsonText);
        const products = Array.isArray(data) ? data : [data];
        
        for (const item of products) {
          if (item['@type'] === 'Product' || item['@type'] === 'https://schema.org/Product') {
            const product = item as ProductLdJson;
            let extractedData: Partial<ScrapedData> = {};
            
            // Extract title
            if (product.name) {
              extractedData.title = product.name;
            }
            
            // Extract price and availability
            if (product.offers) {
              const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
              const firstOffer = offers[0];
              
              if (firstOffer.price) {
                const priceValue = typeof firstOffer.price === 'string' 
                  ? parseFloat(firstOffer.price.replace(/[^0-9.-]+/g, ''))
                  : firstOffer.price;
                if (!isNaN(priceValue)) {
                  extractedData.price = priceValue;
                }
              }
              
              if (firstOffer.availability) {
                const availability = firstOffer.availability.toLowerCase();
                extractedData.isAvailable = availability.includes('instock') || 
                                          availability.includes('available') ||
                                          availability.includes('https://schema.org/instock');
              }
            }
            
            if (Object.keys(extractedData).length > 0) {
              return extractedData;
            }
          }
        }
      } catch (parseError) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting LD+JSON data:', error);
    return null;
  }
};

export const extractFromMicrodata = ($: cheerio.Root): Partial<ScrapedData> | null => {
  try {
    const productScope = $('[itemscope][itemtype*="Product"]').first();
    if (productScope.length === 0) return null;

    let extractedData: Partial<ScrapedData> = {};

    // Extract title from name property
    const nameElement = productScope.find('[itemprop="name"]').first();
    if (nameElement.length > 0) {
      extractedData.title = nameElement.text().trim();
    }

    // Extract price from offers
    const offersElement = productScope.find('[itemprop="offers"]').first();
    if (offersElement.length > 0) {
      const priceElement = offersElement.find('[itemprop="price"]').first();
      if (priceElement.length > 0) {
        const priceValue = priceElement.attr('content') || priceElement.text();
        const parsedPrice = parseFloat(priceValue.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(parsedPrice)) {
          extractedData.price = parsedPrice;
        }
      }

      // Extract availability
      const availabilityElement = offersElement.find('[itemprop="availability"]').first();
      if (availabilityElement.length > 0) {
        const availability = (availabilityElement.attr('href') || availabilityElement.text()).toLowerCase();
        extractedData.isAvailable = availability.includes('instock') || 
                                   availability.includes('available');
      }
    }

    return Object.keys(extractedData).length > 0 ? extractedData : null;
  } catch (error) {
    console.error('Error extracting microdata:', error);
    return null;
  }
};

export const extractFromHeuristics = ($: cheerio.Root): Partial<ScrapedData> | null => {
  try {
    let extractedData: Partial<ScrapedData> = {};

    // Extract title from common selectors and meta tags
    if (!extractedData.title) {
      const titleSelectors = [
        'h1', 'h1.title', 'h1.product-title', 'h1.product-name',
        '.product-title', '.product-name', '.title',
        '[data-testid*="title"]', '[data-cy*="title"]'
      ];
      
      for (const selector of titleSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          const text = element.text().trim();
          if (text && text.length > 3) {
            extractedData.title = text;
            break;
          }
        }
      }
      
      // Fallback to meta tags
      if (!extractedData.title) {
        extractedData.title = $('meta[property="og:title"]').attr('content') ||
                             $('meta[name="title"]').attr('content') ||
                             $('title').text().trim() || '';
      }
    }

    // Extract price from text patterns and common selectors
    if (extractedData.price === null) {
      const priceSelectors = [
        '.price', '.product-price', '.current-price', '.sale-price',
        '[class*="price"]', '[data-testid*="price"]', '[data-cy*="price"]',
        '.cost', '.amount', '.value'
      ];

      for (const selector of priceSelectors) {
        const elements = $(selector);
        elements.each((_, element) => {
          const text = $(element).text().trim();
          const priceMatch = text.match(/[\$£€¥₹]\s*([0-9,]+\.?[0-9]*)|([0-9,]+\.?[0-9]*)\s*[\$£€¥₹]/);
          if (priceMatch) {
            const priceValue = parseFloat((priceMatch[1] || priceMatch[2]).replace(/,/g, ''));
            if (!isNaN(priceValue) && priceValue > 0) {
              extractedData.price = priceValue;
              return false; // Break the each loop
            }
          }
        });
        if (extractedData.price !== null) break;
      }

      // Fallback: search all text for price patterns
      if (extractedData.price === null) {
        const bodyText = $('body').text();
        const globalPriceMatch = bodyText.match(/(?:price|cost|amount)[\s:]*[\$£€¥₹]\s*([0-9,]+\.?[0-9]*)/i);
        if (globalPriceMatch) {
          const priceValue = parseFloat(globalPriceMatch[1].replace(/,/g, ''));
          if (!isNaN(priceValue) && priceValue > 0) {
            extractedData.price = priceValue;
          }
        }
      }
    }

    // Extract availability from text patterns and attributes
    const availabilitySelectors = [
      '.availability', '.stock-status', '.inventory-status',
      '[class*="stock"]', '[class*="availability"]', '[class*="inventory"]',
      '[data-testid*="stock"]', '[data-testid*="availability"]'
    ];

    let availabilityText = '';
    for (const selector of availabilitySelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        availabilityText = element.text().toLowerCase().trim();
        break;
      }
    }

    // Check for availability indicators in text
    if (!availabilityText) {
      const bodyText = $('body').text().toLowerCase();
      const availabilityKeywords = [
        'in stock', 'available', 'out of stock', 'unavailable', 
        'sold out', 'limited stock', 'low stock', 'back in stock'
      ];
      
      for (const keyword of availabilityKeywords) {
        if (bodyText.includes(keyword)) {
          availabilityText = keyword;
          break;
        }
      }
    }

    // Determine availability based on text
    if (availabilityText) {
      const inStockKeywords = ['in stock', 'available', 'limited stock', 'low stock', 'back in stock'];
      const outOfStockKeywords = ['out of stock', 'unavailable', 'sold out'];
      
      extractedData.isAvailable = inStockKeywords.some(keyword => availabilityText.includes(keyword)) &&
                                 !outOfStockKeywords.some(keyword => availabilityText.includes(keyword));
    } else {
      // Default heuristic: if we found a price, assume it's available
      extractedData.isAvailable = extractedData.price !== null && extractedData.price !== undefined;
    }

    return Object.keys(extractedData).length > 0 ? extractedData : null;
  } catch (error) {
    console.error('Error extracting heuristic data:', error);
    return null;
  }
};

export const scrapeListingData = async (url: string): Promise<ScrapedData> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    let scrapedData: ScrapedData = {
      title: '',
      price: null,
      isAvailable: false
    };

    // Strategy 1: Extract from LD+JSON
    const ldJsonData = extractFromLdJson($);
    if (ldJsonData) {
      if (ldJsonData.title) scrapedData.title = ldJsonData.title;
      if (ldJsonData.price !== undefined) scrapedData.price = ldJsonData.price;
      if (ldJsonData.isAvailable !== undefined) scrapedData.isAvailable = ldJsonData.isAvailable;
    }

    // Strategy 2: Extract from microdata if LD+JSON didn't provide complete data
    if (!scrapedData.title || scrapedData.price === null || !scrapedData.isAvailable) {
      const microdataData = extractFromMicrodata($);
      if (microdataData) {
        if (!scrapedData.title && microdataData.title) scrapedData.title = microdataData.title;
        if (scrapedData.price === null && microdataData.price !== undefined) scrapedData.price = microdataData.price;
        if (!scrapedData.isAvailable && microdataData.isAvailable !== undefined) scrapedData.isAvailable = microdataData.isAvailable;
      }
    }

    // Strategy 3: Heuristic fallback if structured data didn't provide complete data
    if (!scrapedData.title || scrapedData.price === null || !scrapedData.isAvailable) {
      const heuristicData = extractFromHeuristics($);
      if (!scrapedData.title && heuristicData.title) scrapedData.title = heuristicData.title;
      if (scrapedData.price === null && heuristicData.price !== undefined) scrapedData.price = heuristicData.price;
      if (!scrapedData.isAvailable && heuristicData.isAvailable !== undefined) scrapedData.isAvailable = heuristicData.isAvailable;
    }

    return scrapedData;
  } catch (error) {
    console.error('Error scraping listing data:', error);
    throw error;
  }
}
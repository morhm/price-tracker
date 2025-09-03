import * as cheerio from 'cheerio';
import { ScrapedData } from './index';

export const extractFromMicrodata = ($: cheerio.Root): Partial<ScrapedData> | null => {
  try {
    const productScope = $('[itemscope][itemtype*="Product"]').first();
    if (productScope.length === 0) return null;

    const extractedData: Partial<ScrapedData> = {};

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
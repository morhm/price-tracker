import * as cheerio from 'cheerio';
import { ScrapedData } from './index';

export const extractFromHeuristics = ($: cheerio.Root): Partial<ScrapedData> | null => {
  try {
    const extractedData: Partial<ScrapedData> = {};

    // Extract title from common selectors and meta tags
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
    // Extract price from text patterns and common selectors
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
      if (extractedData.price !== undefined) break;
    }

    // Fallback: search all text for price patterns
    if (extractedData.price === undefined) {
      const bodyText = $('body').text();
      const globalPriceMatch = bodyText.match(/[\$£€¥₹]\s*([0-9,]+\.?[0-9]*)|([0-9,]+\.?[0-9]*)\s*[\$£€¥₹]/);
      if (globalPriceMatch) {
        const priceValue = parseFloat((globalPriceMatch[1] || globalPriceMatch[2]).replace(/,/g, ''));
        if (!isNaN(priceValue) && priceValue > 0) {
          extractedData.price = priceValue;
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
    } else if (extractedData.price !== null && extractedData.price !== undefined) {
      // Default heuristic: if we found a price, assume it's available
      extractedData.isAvailable = true;
    }

    // Return null if no meaningful data was extracted
    const hasTitle = extractedData.title && extractedData.title.trim().length > 0;
    const hasPrice = extractedData.price !== null && extractedData.price !== undefined;
    const hasAvailability = extractedData.isAvailable !== undefined;
    
    return (hasTitle || hasPrice || hasAvailability) ? extractedData : null;
  } catch (error) {
    console.error('Error extracting heuristic data:', error);
    return null;
  }
};
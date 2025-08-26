import * as cheerio from 'cheerio';

import { ScrapedData } from './index';

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
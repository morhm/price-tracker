import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cheerio from 'cheerio';

import { extractFromLdJson } from './index';

describe('extractFromLdJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract product data from valid ld+json script', () => {
    const $ = cheerio.load(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Test Product",
          "offers": {
            "price": "19.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
    `);

    const result = extractFromLdJson($);
    expect(result).toEqual({
      title: 'Test Product',
      price: 19.99,
      isAvailable: true
    });
  });

  it('should return null for no ld+json scripts', () => {
    const $ = cheerio.load('<div>No LD+JSON here</div>');
    const result = extractFromLdJson($);
    expect(result).toBeNull();
  });

  it('should handle multiple ld+json scripts', () => {
    const $ = cheerio.load(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "First Product",
          "offers": {
            "price": "29.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Second Product",
          "offers": {
            "price": "39.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/OutOfStock"
          }
        }
      </script>
    `);

    const result = extractFromLdJson($);
    expect(result).toEqual({
      title: 'First Product',
      price: 29.99,
      isAvailable: true
    });
  });
});